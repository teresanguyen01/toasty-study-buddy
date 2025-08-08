import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import dbConnect from "@/lib/db/connection";
import Deck from "@/lib/db/models/Deck";
import Card from "@/lib/db/models/Card";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CardWithRelevance {
  _id: string;
  front: string;
  back: string;
  relevance: number;
}

// Simple keyword-based retrieval function
function findRelevantCards(
  cards: Array<{ front: string; back: string; _id: string }>,
  userMessage: string
): CardWithRelevance[] {
  const message = userMessage.toLowerCase();
  const keywords = message.split(" ").filter((word) => word.length > 3);

  return cards
    .map((card) => {
      const cardText = `${card.front} ${card.back}`.toLowerCase();
      let relevance = 0;

      keywords.forEach((keyword) => {
        if (cardText.includes(keyword)) {
          relevance += 1;
        }
      });

      return { ...card, relevance };
    })
    .filter((card) => card.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5); // Return top 5 most relevant cards
}

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: "Message and userId are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        response:
          "I'm sorry, but I'm not currently available. The OpenAI API key needs to be configured to enable AI chat functionality. Please contact the administrator to set up the API key.",
      });
    }

    // Connect to database and fetch user's flashcards
    await dbConnect();

    // Get user's decks
    const decks = await Deck.find({ ownerId: userId }).lean();
    const deckIds = decks.map((deck) => deck._id);

    let relevantCards: CardWithRelevance[] = [];
    let contextInfo = "";

    if (deckIds.length > 0) {
      // Get all user's cards
      const allCards = await Card.find({ deckId: { $in: deckIds } }).lean();

      // Find relevant cards based on user's message
      relevantCards = findRelevantCards(allCards, message);

      if (relevantCards.length > 0) {
        contextInfo = `\n\nHere are some relevant flashcards from your study material:\n${relevantCards
          .map(
            (card, index) =>
              `${index + 1}. Q: ${card.front}\n   A: ${card.back}\n`
          )
          .join("\n")}`;
      }
    }

    const systemPrompt = `You are an AI study buddy designed to help students with their learning. You should:

1. Be encouraging and supportive
2. Provide clear, concise explanations
3. Give practical study tips and strategies
4. Help with concept explanations
5. Create practice questions when asked
6. Suggest study methods and techniques
7. Be patient and thorough in your responses
8. Use examples when helpful
9. Encourage active learning
10. Reference the user's specific flashcards when relevant

Keep responses educational, helpful, and focused on learning. If asked about topics outside of education, politely redirect to study-related topics.

When the user asks questions related to their flashcards, use that specific content to provide personalized help. You can reference their cards, explain concepts from their material, or create additional practice questions based on their content.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt + contextInfo,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({
      response,
      relevantCards: relevantCards.length > 0 ? relevantCards.slice(0, 3) : [], // Return top 3 for UI display
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to get response from AI" },
      { status: 500 }
    );
  }
}
