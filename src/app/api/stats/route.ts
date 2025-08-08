import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Deck from "@/lib/db/models/Deck";
import Card from "@/lib/db/models/Card";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all user's decks
    const decks = await Deck.find({ ownerId: userId }).lean();
    const deckIds = decks.map((deck) => deck._id);

    // If no decks, return empty stats
    if (deckIds.length === 0) {
      return NextResponse.json({
        dueCards: 0,
        totalCards: 0,
        studiedCards: 0,
        completionRate: 0,
        streak: 0,
      });
    }

    // Get all cards from user's decks
    const cards = await Card.find({ deckId: { $in: deckIds } }).lean();

    // Calculate due cards (cards that need review today)
    const now = new Date();
    const dueCards = cards.filter(
      (card) => new Date(card.sm2.nextReview) <= now
    ).length;

    // Calculate total cards
    const totalCards = cards.length;

    // Calculate studied cards (cards that have been reviewed at least once)
    const studiedCards = cards.filter(
      (card) => card.sm2.repetitions > 0
    ).length;

    // Calculate completion rate
    const completionRate =
      totalCards > 0 ? Math.round((studiedCards / totalCards) * 100) : 0;

    // Calculate streak (days in a row with study activity)
    // For now, we'll use a simple calculation based on cards studied today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cardsStudiedToday = cards.filter((card) => {
      const lastStudied = new Date(card.sm2.nextReview);
      lastStudied.setHours(0, 0, 0, 0);
      return lastStudied.getTime() === today.getTime();
    }).length;

    // For now, we'll use a simple streak calculation
    // In a real app, you'd track daily study sessions
    const streak = cardsStudiedToday > 0 ? 1 : 0;

    // Calculate average ease factor
    const cardsWithEaseFactor = cards.filter((card) => card.sm2.easeFactor > 0);
    const averageEaseFactor =
      cardsWithEaseFactor.length > 0
        ? cardsWithEaseFactor.reduce(
            (sum, card) => sum + card.sm2.easeFactor,
            0
          ) / cardsWithEaseFactor.length
        : 2.5;

    // Calculate cards by difficulty
    const cardsByDifficulty = {
      easy: cards.filter((card) => card.sm2.easeFactor >= 2.5).length,
      medium: cards.filter(
        (card) => card.sm2.easeFactor >= 2.0 && card.sm2.easeFactor < 2.5
      ).length,
      hard: cards.filter((card) => card.sm2.easeFactor < 2.0).length,
    };

    // Generate recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const cardsStudiedOnDate = cards.filter((card) => {
        const lastStudied = new Date(card.sm2.nextReview);
        lastStudied.setHours(0, 0, 0, 0);
        return lastStudied.getTime() === date.getTime();
      }).length;

      recentActivity.push({
        date: date.toISOString(),
        cardsStudied: cardsStudiedOnDate,
      });
    }

    return NextResponse.json({
      dueCards,
      totalCards,
      studiedCards,
      completionRate,
      streak,
      averageEaseFactor,
      cardsByDifficulty,
      recentActivity,
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
