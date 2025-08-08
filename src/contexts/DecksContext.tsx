"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface Deck {
  _id: string;
  title: string;
  description: string;
  cardCount: number;
  lastStudied?: string;
  visibility: "private" | "friends" | "public";
  createdAt: string;
}

interface DecksContextType {
  decks: Deck[];
  loading: boolean;
  error: string | null;
  refreshDecks: () => void;
  deleteDeck: (deckId: string) => Promise<void>;
}

const DecksContext = createContext<DecksContextType | undefined>(undefined);

export function DecksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/decks?userId=${user.uid}`);

      if (!response.ok) {
        throw new Error("Failed to fetch decks");
      }

      const data = await response.json();
      const decksData = data.decks || [];
      setDecks(decksData);
    } catch (err) {
      console.error("Error fetching decks:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch decks");
    } finally {
      setLoading(false);
    }
  };

  const refreshDecks = () => {
    fetchDecks();
  };

  const deleteDeck = async (deckId: string) => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`/api/decks?deckId=${deckId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete deck");
      }

      // Remove deck from local state
      const updatedDecks = decks.filter((deck) => deck._id !== deckId);
      setDecks(updatedDecks);
    } catch (err) {
      console.error("Error deleting deck:", err);
      setError(err instanceof Error ? err.message : "Failed to delete deck");
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchDecks();
    } else {
      setDecks([]);
      setLoading(false);
    }
  }, [user?.uid]);

  const value = {
    decks,
    loading,
    error,
    refreshDecks,
    deleteDeck,
  };

  return (
    <DecksContext.Provider value={value}>{children}</DecksContext.Provider>
  );
}

export function useDecks() {
  const context = useContext(DecksContext);
  if (context === undefined) {
    throw new Error("useDecks must be used within a DecksProvider");
  }
  return context;
}
