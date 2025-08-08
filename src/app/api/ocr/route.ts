import { NextRequest, NextResponse } from "next/server";
import {
  extractTextFromFile,
  cleanExtractedText,
  validateOCRResult,
} from "@/lib/ocr/text-extractor";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

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
      return NextResponse.json(
        { error: "File must be an image (JPEG, PNG, GIF, BMP, WebP) or PDF" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text using OCR or PDF parsing
    const ocrResult = await extractTextFromFile(buffer, file.type);

    // Clean the extracted text
    const cleanedText = cleanExtractedText(ocrResult.text);

    // Validate the result
    const validation = validateOCRResult({
      ...ocrResult,
      text: cleanedText,
    });

    return NextResponse.json({
      text: cleanedText,
      confidence: ocrResult.confidence,
      isValid: validation.isValid,
      suggestions: validation.suggestions,
      wordCount: cleanedText.split(/\s+/).length,
      fileType: file.type,
    });
  } catch (error) {
    console.error("OCR API Error:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "OCR API endpoint. Use POST with image or PDF file." },
    { status: 200 }
  );
}
