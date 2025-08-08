"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useDecks } from "@/contexts/DecksContext";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Users,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

export default function DecksPage() {
  const { user } = useAuth();
  const { decks, loading, error, refreshDecks, deleteDeck } = useDecks();

  const handleDeleteDeck = async (deckId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this deck? This action cannot be undone."
      )
    ) {
      return;
    }

    await deleteDeck(deckId);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "private":
        return <EyeOff className="w-4 h-4 text-muted-foreground" />;
      case "friends":
        return <Users className="w-4 h-4 text-primary" />;
      case "public":
        return <Eye className="w-4 h-4 text-green-500" />;
      default:
        return <EyeOff className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case "private":
        return "Private";
      case "friends":
        return "Friends";
      case "public":
        return "Public";
      default:
        return "Private";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-foreground font-header">
                My Decks
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshDecks}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                title="Refresh decks"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <DarkModeToggle />
              <Link
                href="/"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-card-foreground">
                  {decks.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Decks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-card-foreground">
                  {decks.reduce((sum, deck) => sum + deck.cardCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-card-foreground">
                  {decks.filter((deck) => deck.visibility === "public").length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Public Decks
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-card-foreground">
                  {decks.filter((deck) => deck.lastStudied).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Studied Recently
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Decks Grid */}
        {decks.length === 0 ? (
          <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              No decks yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first deck to start studying!
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Deck
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck._id}
                className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {deck.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getVisibilityIcon(deck.visibility)}
                    <span className="text-xs text-muted-foreground">
                      {getVisibilityText(deck.visibility)}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {deck.description || "No description"}
                </p>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{deck.cardCount} cards</span>
                  {deck.lastStudied && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        {new Date(deck.lastStudied).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href={`/study/${deck._id}`}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Study Now
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/decks/${deck._id}/cards`}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                      title="Manage Cards"
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <button
                      onClick={() => handleDeleteDeck(deck._id)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
