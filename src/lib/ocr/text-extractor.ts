import Tesseract from "tesseract.js";

export interface ExtractedText {
  text: string;
  confidence: number;
  blocks: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

export async function extractTextFromImage(
  imageFile: File | string
): Promise<ExtractedText> {
  try {
    console.log("Starting OCR processing...");

    const result = await Tesseract.recognize(imageFile, "eng", {
      logger: (m) => console.log("OCR Progress:", m),
    });

    const extractedText = result.data.text.trim();
    const confidence = result.data.confidence;

    console.log("OCR completed:", {
      textLength: extractedText.length,
      confidence,
      blocks: result.data.blocks?.length || 0,
    });

    return {
      text: extractedText,
      confidence,
      blocks:
        result.data.blocks?.map((block) => ({
          text: block.text,
          confidence: block.confidence,
          bbox: block.bbox,
        })) || [],
    };
  } catch (error) {
    console.error("OCR processing error:", error);
    throw new Error("Failed to extract text from image");
  }
}

export async function generateFlashcardsFromText(
  text: string,
  count: number = 5
): Promise<Array<{ question: string; answer: string }>> {
  // Simple rule-based flashcard generation
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const flashcards: Array<{ question: string; answer: string }> = [];

  for (let i = 0; i < Math.min(count, sentences.length); i++) {
    const sentence = sentences[i];

    // Simple question generation patterns
    if (sentence.includes("is") || sentence.includes("are")) {
      const parts = sentence.split(/\s+(is|are)\s+/);
      if (parts.length >= 2) {
        flashcards.push({
          question: `What ${parts[1]} ${parts[0]}?`,
          answer: parts.slice(2).join(" "),
        });
      }
    } else if (sentence.includes(":")) {
      const [term, definition] = sentence.split(":").map((s) => s.trim());
      if (term && definition) {
        flashcards.push({
          question: `What is ${term}?`,
          answer: definition,
        });
      }
    } else {
      // Generic question
      flashcards.push({
        question: `What does this statement mean: "${sentence.substring(
          0,
          50
        )}..."?`,
        answer: sentence,
      });
    }
  }

  return flashcards;
}
