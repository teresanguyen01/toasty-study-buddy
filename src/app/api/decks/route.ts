import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Deck from "@/lib/db/models/Deck";

interface DeckQuery {
  ownerId: string;
  visibility?: string;
}

interface DeckUpdateData {
  title?: string;
  description?: string;
  visibility?: string;
  tags?: string[];
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const deckId = searchParams.get("deckId");
    const visibility = searchParams.get("visibility");

    // If deckId is provided, fetch a specific deck
    if (deckId) {
      const deck = await Deck.findById(deckId).lean();

      if (!deck) {
        return NextResponse.json({ error: "Deck not found" }, { status: 404 });
      }

      return NextResponse.json({
        deck,
      });
    }

    // Otherwise, fetch decks by userId
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Build query
    const query: DeckQuery = { ownerId: userId };

    if (visibility) {
      query.visibility = visibility;
    }

    const decks = await Deck.find(query).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({
      decks,
      count: decks.length,
    });
  } catch (error) {
    console.error("Get Decks API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch decks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { title, description, visibility, tags, ownerId } =
      await request.json();

    if (!title || !ownerId) {
      return NextResponse.json(
        { error: "Title and owner ID are required" },
        { status: 400 }
      );
    }

    // Validate visibility
    if (visibility && !["private", "friends", "public"].includes(visibility)) {
      return NextResponse.json(
        { error: "Invalid visibility setting" },
        { status: 400 }
      );
    }

    const deck = new Deck({
      title: title.trim(),
      description: description?.trim() || "",
      visibility: visibility || "private",
      tags: tags || [],
      ownerId,
    });

    await deck.save();

    return NextResponse.json(
      {
        deck,
        message: "Deck created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Deck API Error:", error);

    if (error instanceof Error && error.message.includes("duplicate")) {
      return NextResponse.json(
        { error: "A deck with this title already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create deck" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { deckId, title, description, visibility, tags } =
      await request.json();

    if (!deckId) {
      return NextResponse.json(
        { error: "Deck ID is required" },
        { status: 400 }
      );
    }

    const updateData: DeckUpdateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (visibility !== undefined) {
      if (!["private", "friends", "public"].includes(visibility)) {
        return NextResponse.json(
          { error: "Invalid visibility setting" },
          { status: 400 }
        );
      }
      updateData.visibility = visibility;
    }
    if (tags !== undefined) updateData.tags = tags;

    const deck = await Deck.findByIdAndUpdate(deckId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json({
      deck,
      message: "Deck updated successfully",
    });
  } catch (error) {
    console.error("Update Deck API Error:", error);
    return NextResponse.json(
      { error: "Failed to update deck" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get("deckId");

    if (!deckId) {
      return NextResponse.json(
        { error: "Deck ID is required" },
        { status: 400 }
      );
    }

    const deck = await Deck.findByIdAndDelete(deckId);

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Deck deleted successfully",
    });
  } catch (error) {
    console.error("Delete Deck API Error:", error);
    return NextResponse.json(
      { error: "Failed to delete deck" },
      { status: 500 }
    );
  }
}
