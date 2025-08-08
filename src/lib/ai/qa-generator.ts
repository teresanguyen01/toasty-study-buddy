import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface QAPair {
  question: string;
  answer: string;
}

export async function generateQAPairs(text: string): Promise<QAPair[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = `
You are an expert educator creating flashcards from study notes. 
Generate 5-10 high-quality question-answer pairs from the following text.

Guidelines:
- Questions should test understanding, not just memorization
- Mix different question types: definition, application, comparison, analysis
- Keep questions clear and concise
- Answers should be accurate and complete
- Focus on key concepts and important details

Text to convert:
${text}

Return only a JSON array of objects with "question" and "answer" fields.
Example format:
[
  {"question": "What is...?", "answer": "..."},
  {"question": "How does...?", "answer": "..."}
]
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates educational flashcards. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const qaPairs: QAPair[] = JSON.parse(response);

    // Validate the response
    if (!Array.isArray(qaPairs)) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Filter out invalid entries
    const validPairs = qaPairs.filter(
      (pair) =>
        pair &&
        typeof pair.question === "string" &&
        typeof pair.answer === "string" &&
        pair.question.trim() !== "" &&
        pair.answer.trim() !== ""
    );

    return validPairs.slice(0, 10); // Limit to 10 pairs
  } catch (error) {
    console.error("Error generating Q/A pairs:", error);
    throw new Error("Failed to generate Q/A pairs");
  }
}

export async function improveQA(qaPair: QAPair): Promise<QAPair> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = `
Improve this flashcard question and answer to make it more educational and clear:

Question: ${qaPair.question}
Answer: ${qaPair.answer}

Make the question more specific and the answer more comprehensive while maintaining accuracy.
Return only a JSON object with "question" and "answer" fields.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that improves educational flashcards. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    const improved: QAPair = JSON.parse(response);
    return improved;
  } catch (error) {
    console.error("Error improving Q/A pair:", error);
    return qaPair; // Return original if improvement fails
  }
}
