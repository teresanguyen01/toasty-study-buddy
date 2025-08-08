import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log("Processing file upload request");
    console.log(
      "Request headers:",
      Object.fromEntries(request.headers.entries())
    );
    console.log("Request method:", request.method);
    console.log("Request URL:", request.url);

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OpenAI API key not found");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    let formData;
    try {
      // Check if the request has the correct content type
      const contentType = request.headers.get("content-type");
      console.log("Content-Type:", contentType);

      if (!contentType || !contentType.includes("multipart/form-data")) {
        console.error("Invalid content type:", contentType);
        return NextResponse.json(
          { error: "Request must be multipart/form-data" },
          { status: 400 }
        );
      }

      formData = await request.formData();
      console.log("FormData parsed successfully");
    } catch (error) {
      console.error("FormData parsing error:", error);
      return NextResponse.json(
        { error: "Invalid file upload format" },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check if file is empty
    if (file.size === 0) {
      console.error("Empty file provided");
      return NextResponse.json(
        { error: "File is empty. Please select a valid file." },
        { status: 400 }
      );
    }

    // Check if file has a valid name
    if (!file.name || file.name.trim() === "") {
      console.error("File has no name");
      return NextResponse.json(
        { error: "File has no name. Please select a valid file." },
        { status: 400 }
      );
    }

    console.log("File received:", file.name, file.type, file.size);

    // Validate file type
    const supportedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "application/pdf",
    ];

    if (!supportedTypes.includes(file.type)) {
      console.error("Unsupported file type:", file.type);
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Please upload an image (JPEG, PNG, GIF, BMP, WebP) or PDF file.`,
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error("File too large:", file.size);
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Convert file to base64 for OpenAI with better error handling
    let buffer: Buffer;
    let base64: string;
    let mimeType: string;

    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      base64 = buffer.toString("base64");
      mimeType = file.type;

      console.log(
        "File converted to base64 successfully, size:",
        buffer.length
      );
    } catch (error) {
      console.error("Error converting file to base64:", error);

      // Provide more specific error messages based on the error type
      if (
        error instanceof Error &&
        error.message.includes("The requested file could not be read")
      ) {
        return NextResponse.json(
          {
            error:
              "File access error: The file could not be read. Please try with a different file or check file permissions.",
          },
          { status: 500 }
        );
      } else if (
        error instanceof Error &&
        error.message.includes("arrayBuffer")
      ) {
        return NextResponse.json(
          {
            error:
              "File processing error: Unable to read file content. Please try with a different file format.",
          },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          {
            error:
              "Failed to process file. Please try again with a different file.",
          },
          { status: 500 }
        );
      }
    }

    console.log("Calling OpenAI API");

    // Use OpenAI to extract text and generate Q/A pairs
    const prompt = `Please analyze this ${
      file.type.startsWith("image/") ? "image" : "PDF"
    } and:

1. Extract all the text content clearly and accurately
2. Generate 5-10 high-quality flashcard question-answer pairs based on the content
3. Focus on key concepts, definitions, and important information
4. Make questions that test understanding, not just memorization
5. Ensure answers are comprehensive but concise

Format the response as:
TEXT: [extracted text content]
Q&A:
Q1: [question]
A1: [answer]
Q2: [question]
A2: [answer]
...and so on`;

    const response = await openai.chat.completions
      .create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      })
      .catch((error) => {
        console.error("OpenAI API error:", error);
        throw new Error(`OpenAI API error: ${error.message}`);
      });

    console.log("OpenAI response received");

    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.error("No content in OpenAI response");
      return NextResponse.json(
        { error: "Failed to process file with AI" },
        { status: 500 }
      );
    }

    console.log("Parsing OpenAI response");

    // Parse the response to extract text and Q/A pairs
    const textMatch = content.match(/TEXT:\s*([\s\S]*?)(?=Q&A:|$)/);
    const qaSection = content.match(/Q&A:\s*([\s\S]*)/);

    let extractedText = "";
    const qaPairs: Array<{ question: string; answer: string }> = [];

    if (textMatch) {
      extractedText = textMatch[1].trim();
    }

    if (qaSection) {
      const qaContent = qaSection[1];
      // Use a simpler regex approach
      const qaMatches = qaContent.match(
        /Q\d+:\s*(.*?)\s*A\d+:\s*(.*?)(?=Q\d+:|$)/g
      );

      if (qaMatches) {
        for (const match of qaMatches) {
          const parts = match.match(/Q\d+:\s*(.*?)\s*A\d+:\s*(.*)/);
          if (parts && parts[1] && parts[2]) {
            qaPairs.push({
              question: parts[1].trim(),
              answer: parts[2].trim(),
            });
          }
        }
      }
    }

    // If parsing failed, try a simpler approach
    if (qaPairs.length === 0) {
      const lines = content.split("\n");
      let currentQuestion = "";

      for (const line of lines) {
        if (line.trim().startsWith("Q") && line.includes(":")) {
          currentQuestion = line.split(":")[1]?.trim() || "";
        } else if (
          line.trim().startsWith("A") &&
          line.includes(":") &&
          currentQuestion
        ) {
          const answer = line.split(":")[1]?.trim() || "";
          if (currentQuestion && answer) {
            qaPairs.push({ question: currentQuestion, answer });
            currentQuestion = "";
          }
        }
      }
    }

    // If still no Q/A pairs, create a simple one from the extracted text
    if (qaPairs.length === 0 && extractedText) {
      qaPairs.push({
        question: "What is the main content of this document?",
        answer:
          extractedText.substring(0, 200) +
          (extractedText.length > 200 ? "..." : ""),
      });
    }

    console.log("Returning result with", qaPairs.length, "Q/A pairs");

    return NextResponse.json({
      text: extractedText,
      qaPairs,
      count: qaPairs.length,
      fileType: file.type,
      confidence: 95, // High confidence for AI processing
      isValid: qaPairs.length > 0,
      suggestions:
        qaPairs.length === 0
          ? [
              "No Q/A pairs generated. Please try with a clearer image or different content.",
            ]
          : [],
    });
  } catch (error) {
    console.error("File Processing API Error:", error);

    if (error instanceof Error && error.message.includes("OpenAI")) {
      return NextResponse.json(
        {
          error: "AI service temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "File Processing API endpoint. Use POST with image or PDF file.",
    },
    { status: 200 }
  );
}
