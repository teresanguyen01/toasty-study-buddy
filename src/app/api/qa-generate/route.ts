import { NextRequest, NextResponse } from "next/server";
import { generateQAPairs, improveQA } from "@/lib/ai/qa-generator";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    if (text.length < 10) {
      return NextResponse.json(
        { error: "Text must be at least 10 characters long" },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: "Text must be less than 10,000 characters" },
        { status: 400 }
      );
    }

    // Generate Q/A pairs
    const qaPairs = await generateQAPairs(text);

    if (qaPairs.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate Q/A pairs from the provided text" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      qaPairs,
      count: qaPairs.length,
      originalText: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
    });
  } catch (error) {
    console.error("Q/A Generation API Error:", error);

    if (error instanceof Error && error.message.includes("OpenAI")) {
      return NextResponse.json(
        {
          error: "AI service temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate Q/A pairs" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { question, answer } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Both question and answer are required" },
        { status: 400 }
      );
    }

    // Improve the Q/A pair
    const improvedQA = await improveQA({ question, answer });

    return NextResponse.json({
      qaPair: improvedQA,
    });
  } catch (error) {
    console.error("Q/A Improvement API Error:", error);

    if (error instanceof Error && error.message.includes("OpenAI")) {
      return NextResponse.json(
        {
          error: "AI service temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to improve Q/A pair" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Q/A Generation API endpoint. Use POST with text content." },
    { status: 200 }
  );
}
