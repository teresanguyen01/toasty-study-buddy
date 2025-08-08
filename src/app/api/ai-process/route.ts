import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log("Enhanced AI image processing request");

    const {
      imageData,
      contentType,
      processingType = "flashcards",
    } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Validate imageData is not empty
    if (typeof imageData === "string" && imageData.trim() === "") {
      return NextResponse.json(
        { error: "Image data is empty. Please provide a valid file." },
        { status: 400 }
      );
    }

    // Validate contentType
    if (!contentType) {
      return NextResponse.json(
        { error: "Content type is required" },
        { status: 400 }
      );
    }

    // Determine the appropriate prompt based on processing type
    let systemPrompt = "";
    let userPrompt = "";

    switch (processingType) {
      case "flashcards":
        systemPrompt = `You are an expert educational content creator. Your task is to analyze images and PDFs and create high-quality flashcards that promote deep learning and understanding.`;
        userPrompt = `Analyze this ${
          contentType.startsWith("image/") ? "image" : "PDF"
        } and create 8-12 high-quality flashcards. 

Requirements:
1. Extract all text content accurately
2. Identify key concepts, definitions, and important information
3. Create questions that test understanding, not just memorization
4. Include a mix of question types: definition, application, analysis, synthesis
5. Ensure answers are comprehensive but concise
6. Focus on the most important concepts from the content

Format your response exactly as:
TEXT: [extracted text content]
FLASHCARDS:
Q1: [question]
A1: [answer]
Q2: [question]
A2: [answer]
...and so on

If the content contains handwritten notes, focus on the main concepts and key points. If it's printed text or PDF content, create more detailed flashcards.`;
        break;

      case "summary":
        systemPrompt = `You are an expert at summarizing educational content from images and PDFs.`;
        userPrompt = `Analyze this ${
          contentType.startsWith("image/") ? "image" : "PDF"
        } and provide a comprehensive summary of the key points and concepts. Include:
1. Main topics covered
2. Key definitions
3. Important concepts
4. Any diagrams or visual elements described

Format as:
SUMMARY: [comprehensive summary]
KEY_POINTS: [bullet points of main concepts]`;
        break;

      case "qa_generation":
        systemPrompt = `You are an expert at creating practice questions from educational content in images and PDFs.`;
        userPrompt = `Analyze this ${
          contentType.startsWith("image/") ? "image" : "PDF"
        } and create practice questions that test understanding of the material. Include:
1. Multiple choice questions
2. Short answer questions
3. Application questions
4. Questions that test different levels of understanding

Format as:
QUESTIONS:
Q1: [question]
A1: [answer]
Q2: [question]
A2: [answer]
...and so on`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid processing type" },
          { status: 400 }
        );
    }

    console.log("Processing with OpenAI Vision API");

    const response = await openai.chat.completions
      .create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userPrompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${contentType};base64,${imageData}`,
                },
              },
            ],
          },
        ],
        max_tokens: 3000,
        temperature: 0.3,
      })
      .catch((error) => {
        console.error("OpenAI API error:", error);
        throw new Error(`OpenAI API error: ${error.message}`);
      });

    console.log("OpenAI response received");

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to process image with AI" },
        { status: 500 }
      );
    }

    // Parse the response based on processing type
    let result: {
      type: string;
      extractedText?: string;
      qaPairs?: Array<{ question: string; answer: string }>;
      count?: number;
      confidence: number;
      isValid: boolean;
      summary?: string;
      keyPoints?: string;
    } = {
      type: "",
      confidence: 0,
      isValid: false,
    };

    if (processingType === "flashcards") {
      const textMatch = content.match(/TEXT:\s*([\s\S]*?)(?=FLASHCARDS:|$)/);
      const flashcardsSection = content.match(/FLASHCARDS:\s*([\s\S]*)/);

      let extractedText = "";
      const qaPairs: Array<{ question: string; answer: string }> = [];

      if (textMatch) {
        extractedText = textMatch[1].trim();
      }

      if (flashcardsSection) {
        const qaContent = flashcardsSection[1];
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

      result = {
        type: "flashcards",
        extractedText,
        qaPairs,
        count: qaPairs.length,
        confidence: 95,
        isValid: qaPairs.length > 0,
      };
    } else if (processingType === "summary") {
      const summaryMatch = content.match(
        /SUMMARY:\s*([\s\S]*?)(?=KEY_POINTS:|$)/
      );
      const keyPointsMatch = content.match(/KEY_POINTS:\s*([\s\S]*)/);

      result = {
        type: "summary",
        summary: summaryMatch ? summaryMatch[1].trim() : "",
        keyPoints: keyPointsMatch ? keyPointsMatch[1].trim() : "",
        confidence: 95,
        isValid: true,
      };
    } else if (processingType === "qa_generation") {
      const qaSection = content.match(/QUESTIONS:\s*([\s\S]*)/);
      const qaPairs: Array<{ question: string; answer: string }> = [];

      if (qaSection) {
        const qaContent = qaSection[1];
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

      result = {
        type: "qa_generation",
        qaPairs,
        count: qaPairs.length,
        confidence: 95,
        isValid: qaPairs.length > 0,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Enhanced AI Processing Error:", error);
    return NextResponse.json(
      { error: "Failed to process image with AI" },
      { status: 500 }
    );
  }
}
