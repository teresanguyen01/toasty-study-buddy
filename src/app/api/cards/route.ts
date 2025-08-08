import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Card from "@/lib/db/models/Card";
import Deck from "@/lib/db/models/Deck";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get("deckId");
    const dueOnly = searchParams.get("dueOnly") === "true";

    if (!deckId) {
      return NextResponse.json(
        { error: "Deck ID is required" },
        { status: 400 }
      );
    }

    // Verify deck exists
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Build query
    const query: { deckId: string; "sm2.nextReview"?: { $lte: Date } } = {
      deckId,
    };

    if (dueOnly) {
      query["sm2.nextReview"] = { $lte: new Date() };
    }

    const cards = await Card.find(query).sort({ "sm2.nextReview": 1 }).lean();

    return NextResponse.json({
      cards,
      count: cards.length,
    });
  } catch (error) {
    console.error("Get Cards API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { deckId, question, answer, tags } = await request.json();

    if (!deckId || !question || !answer) {
      return NextResponse.json(
        { error: "Deck ID, question, and answer are required" },
        { status: 400 }
      );
    }

    // Verify deck exists
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const card = new Card({
      deckId,
      question: question.trim(),
      answer: answer.trim(),
      tags: tags || [],
    });

    await card.save();

    // Update deck card count
    await Deck.findByIdAndUpdate(deckId, {
      $inc: { cardCount: 1 },
      lastStudied: new Date(),
    });

    return NextResponse.json(
      {
        card,
        message: "Card created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Card API Error:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { cardId, question, answer, tags } = await request.json();

    if (!cardId) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 }
      );
    }

    const updateData: { question?: string; answer?: string; tags?: string[] } =
      {};

    if (question !== undefined) updateData.question = question.trim();
    if (answer !== undefined) updateData.answer = answer.trim();
    if (tags !== undefined) updateData.tags = tags;

    const card = await Card.findByIdAndUpdate(cardId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      card,
      message: "Card updated successfully",
    });
  } catch (error) {
    console.error("Update Card API Error:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");

    if (!cardId) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 }
      );
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    await Card.findByIdAndDelete(cardId);

    // Update deck card count
    await Deck.findByIdAndUpdate(card.deckId, {
      $inc: { cardCount: -1 },
    });

    return NextResponse.json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("Delete Card API Error:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
