import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Card from "@/lib/db/models/Card";
import Deck from "@/lib/db/models/Deck";
import { calculateSM2, getDueCards, getStudyStats, SM2Data } from "@/lib/sm2";

interface CardWithSM2 {
  _id: string;
  sm2: SM2Data;
  deckId: string;
  question: string;
  answer: string;
  tags: string[];
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get("deckId");
    const userId = searchParams.get("userId");

    if (!deckId) {
      return NextResponse.json(
        { error: "Deck ID is required" },
        { status: 400 }
      );
    }

    // Verify deck exists and user has access
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (userId && deck.ownerId.toString() !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get due cards for review
    const cards = (await Card.find({
      deckId,
    }).lean()) as unknown as CardWithSM2[];
    const dueCards = getDueCards(cards);
    const stats = getStudyStats(cards);

    // Get next card to review (prioritize due cards)
    let nextCard = null;
    if (dueCards.length > 0) {
      // Sort by next review date (earliest first)
      dueCards.sort(
        (a, b) =>
          new Date(a.sm2.nextReview).getTime() -
          new Date(b.sm2.nextReview).getTime()
      );
      nextCard = dueCards[0];
    } else {
      // If no due cards, get the next card to be reviewed
      const nextCards = cards
        .filter((card) => card.sm2.nextReview > new Date())
        .sort(
          (a, b) =>
            new Date(a.sm2.nextReview).getTime() -
            new Date(b.sm2.nextReview).getTime()
        );

      if (nextCards.length > 0) {
        nextCard = nextCards[0];
      }
    }

    return NextResponse.json({
      nextCard,
      stats,
      dueCount: dueCards.length,
      totalCards: cards.length,
    });
  } catch (error) {
    console.error("Get Review API Error:", error);
    return NextResponse.json(
      { error: "Failed to get review data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { cardId, quality } = await request.json();

    if (!cardId || quality === undefined) {
      return NextResponse.json(
        { error: "Card ID and quality rating are required" },
        { status: 400 }
      );
    }

    // Validate quality rating (1-4 scale for Anki-style)
    if (quality < 1 || quality > 4 || !Number.isInteger(quality)) {
      return NextResponse.json(
        { error: "Quality must be an integer between 1 and 4" },
        { status: 400 }
      );
    }

    // Get the card
    const card = await Card.findById(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Calculate new SM-2 values
    const newSM2 = calculateSM2(card.sm2, quality);

    // Update the card
    card.sm2 = newSM2;
    await card.save();

    // Update deck's last studied time
    await Deck.findByIdAndUpdate(card.deckId, {
      lastStudied: new Date(),
    });

    // Get updated stats
    const cards = (await Card.find({
      deckId: card.deckId,
    }).lean()) as unknown as CardWithSM2[];
    const stats = getStudyStats(cards);

    return NextResponse.json({
      card,
      stats,
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.error("Submit Review API Error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { deckId } = await request.json();

    if (!deckId) {
      return NextResponse.json(
        { error: "Deck ID is required" },
        { status: 400 }
      );
    }

    // Get all cards in the deck
    const cards = (await Card.find({
      deckId,
    }).lean()) as unknown as CardWithSM2[];
    const stats = getStudyStats(cards);

    return NextResponse.json({
      stats,
    });
  } catch (error) {
    console.error("Get Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to get study stats" },
      { status: 500 }
    );
  }
}
