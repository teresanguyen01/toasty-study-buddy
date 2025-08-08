"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  BookOpen,
  Search,
  Filter,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

interface Card {
  _id: string;
  question: string;
  answer: string;
  tags: string[];
  sm2: {
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: Date;
  };
  createdAt: string;
  updatedAt: string;
}

interface Deck {
  _id: string;
  title: string;
  description: string;
  cardCount: number;
}

interface EditCard {
  _id?: string;
  question: string;
  answer: string;
  tags: string[];
}

export default function CardsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCard, setEditingCard] = useState<EditCard | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && deckId) {
      fetchDeckAndCards();
    }
  }, [user, deckId]);

  const fetchDeckAndCards = async () => {
    try {
      setLoading(true);

      // Fetch deck details
      const deckResponse = await fetch(`/api/decks?deckId=${deckId}`);
      if (!deckResponse.ok) {
        throw new Error("Failed to fetch deck");
      }
      const deckData = await deckResponse.json();
      setDeck(deckData.deck);

      // Fetch cards for this deck
      const cardsResponse = await fetch(`/api/cards?deckId=${deckId}`);
      if (!cardsResponse.ok) {
        throw new Error("Failed to fetch cards");
      }
      const cardsData = await cardsResponse.json();
      setCards(cardsData.cards || []);
    } catch (err) {
      console.error("Error fetching deck and cards:", err);
      setError(err instanceof Error ? err.message : "Failed to load cards");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (cardData: EditCard) => {
    try {
      setSaving(true);
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deckId,
          question: cardData.question.trim(),
          answer: cardData.answer.trim(),
          tags: cardData.tags.filter((tag) => tag.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create card");
      }

      const newCard = await response.json();
      setCards([...cards, newCard.card]);
      setShowAddForm(false);
      setEditingCard(null);
    } catch (err) {
      console.error("Error creating card:", err);
      alert("Failed to create card");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCard = async (cardData: EditCard) => {
    if (!cardData._id) return;

    try {
      setSaving(true);
      const response = await fetch("/api/cards", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: cardData._id,
          question: cardData.question.trim(),
          answer: cardData.answer.trim(),
          tags: cardData.tags.filter((tag) => tag.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card");
      }

      const updatedCard = await response.json();
      setCards(
        cards.map((card) =>
          card._id === cardData._id ? updatedCard.card : card
        )
      );
      setEditingCard(null);
    } catch (err) {
      console.error("Error updating card:", err);
      alert("Failed to update card");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) {
      return;
    }

    try {
      const response = await fetch(`/api/cards?cardId=${cardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete card");
      }

      setCards(cards.filter((card) => card._id !== cardId));
    } catch (err) {
      console.error("Error deleting card:", err);
      alert("Failed to delete card");
    }
  };

  const filteredCards = cards.filter(
    (card) =>
      card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const startEditing = (card: Card) => {
    setEditingCard({
      _id: card._id,
      question: card.question,
      answer: card.answer,
      tags: [...card.tags],
    });
  };

  const cancelEditing = () => {
    setEditingCard(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/decks")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Decks
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Deck Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The deck you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push("/decks")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Decks
            </button>
          </div>
        </div>
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
              <button
                onClick={() => router.push("/decks")}
                className="mr-4 p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground font-header">
                  {deck.title}
                </h1>
                <p className="text-muted-foreground">Manage Cards</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <button
                onClick={() => router.push(`/study/${deckId}`)}
                className="bg-chart-2 text-primary-foreground px-4 py-2 rounded-lg hover:bg-chart-2/90 transition-colors"
              >
                Study Now
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {filteredCards.length} of {cards.length} cards
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Card Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <CardForm
                onSubmit={handleAddCard}
                onCancel={cancelEditing}
                saving={saving}
                initialData={{ question: "", answer: "", tags: [] }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards List */}
        <div className="space-y-4">
          {filteredCards.map((card) => (
            <motion.div
              key={card._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              {editingCard?._id === card._id ? (
                <CardForm
                  onSubmit={handleUpdateCard}
                  onCancel={cancelEditing}
                  saving={saving}
                  initialData={editingCard}
                />
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {card.question}
                      </h3>
                      <p className="text-gray-600 mb-3">{card.answer}</p>
                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {card.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => startEditing(card)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit card"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete card"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCards.length === 0 && cards.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No cards yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first card to start studying!
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Card
            </button>
          </div>
        )}

        {filteredCards.length === 0 && cards.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No cards found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Card Form Component
interface CardFormProps {
  onSubmit: (data: EditCard) => void;
  onCancel: () => void;
  saving: boolean;
  initialData: EditCard;
}

function CardForm({ onSubmit, onCancel, saving, initialData }: CardFormProps) {
  const [formData, setFormData] = useState<EditCard>(initialData);
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.question.trim() && formData.answer.trim()) {
      onSubmit(formData);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question
          </label>
          <textarea
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="Enter your question..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answer
          </label>
          <textarea
            value={formData.answer}
            onChange={(e) =>
              setFormData({ ...formData, answer: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="Enter your answer..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Add a tag..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              saving || !formData.question.trim() || !formData.answer.trim()
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Card
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
