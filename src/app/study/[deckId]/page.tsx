"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Brain,
  Award,
  Timer,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import FlashcardReview from "@/components/ui/FlashcardReview";
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
}

interface Deck {
  _id: string;
  title: string;
  description: string;
  cardCount: number;
}

interface StudyStats {
  totalCards: number;
  studiedCards: number;
  dueCards: number;
  completionRate: number;
}

// Enhanced animation variants
const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: { duration: 0.3 },
  },
};

const cardVariants = {
  enter: {
    x: 300,
    opacity: 0,
    scale: 0.8,
    rotateY: 45,
  },
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    x: -300,
    opacity: 0,
    scale: 0.8,
    rotateY: -45,
    transition: { duration: 0.3 },
  },
};

const progressVariants = {
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyMode, setStudyMode] = useState<"due" | "all">("due");
  const [studyStats, setStudyStats] = useState<StudyStats>({
    totalCards: 0,
    studiedCards: 0,
    dueCards: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!authLoading && user && deckId) {
      fetchDeckAndCards();
      setSessionStartTime(new Date());
    } else if (!authLoading && !user) {
      // Redirect to login if not authenticated
      router.push("/");
    }
  }, [user, deckId, authLoading, router]);

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

      // Store all cards
      setAllCards(cardsData.cards);

      // Filter due cards (cards that need review)
      const now = new Date();
      const dueCards = cardsData.cards.filter(
        (card: Card) => new Date(card.sm2.nextReview) <= now
      );

      setCards(dueCards);
      setStudyStats({
        totalCards: cardsData.cards.length,
        studiedCards: 0,
        dueCards: dueCards.length,
        completionRate: 0,
      });

      console.log("Fetched deck and cards:", {
        deck: deckData.deck,
        allCards: cardsData.cards.length,
        dueCards: dueCards.length,
      });
    } catch (err) {
      console.error("Error fetching deck and cards:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load study session."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (quality: number) => {
    if (!cards[currentCardIndex]) {
      console.error("No card at current index:", currentCardIndex);
      return;
    }

    console.log(`Rating card ${currentCardIndex} with quality ${quality}`);
    setSelectedRating(quality);

    try {
      // Update card with new SM-2 values
      const response = await fetch(`/api/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: cards[currentCardIndex]._id,
          quality: quality,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card");
      }

      const updatedCard = await response.json();
      console.log("Card updated successfully:", updatedCard.card);

      // Update streak based on quality
      if (quality >= 3) {
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }

      // Update the card in our local state
      const updatedCards = [...cards];
      updatedCards[currentCardIndex] = updatedCard.card;

      let finalCards = updatedCards;

      // Handle card progression based on quality rating
      // Quality 1 (Again) and 2 (Hard) should add card back to deck for later review
      // Quality 3 (Good) and 4 (Easy) should move to next card
      if (quality <= 2) {
        // Add the card back to the end of the deck for "Again" and "Hard"
        const cardToRepeat = { ...updatedCards[currentCardIndex] };
        finalCards = [...updatedCards]; // Create a new array to trigger re-render
        finalCards.push(cardToRepeat);
        console.log(
          `Card ${currentCardIndex} added back to deck due to quality ${quality}. New queue length: ${finalCards.length}`
        );
      }

      setCards(finalCards); // Update the cards state with the potentially new array

      // Update study stats
      setStudyStats((prev) => ({
        ...prev,
        studiedCards: prev.studiedCards + 1,
        completionRate: Math.round(
          ((prev.studiedCards + 1) / prev.dueCards) * 100
        ),
      }));

      // Always move to next card (or complete session)
      // Use finalCards.length to account for newly added cards
      if (currentCardIndex < finalCards.length - 1) {
        const nextIndex = currentCardIndex + 1;
        console.log(`Moving to next card ${nextIndex} of ${finalCards.length}`);
        setTimeout(() => {
          setCurrentCardIndex(nextIndex);
        }, 500); // Add slight delay for better UX
      } else {
        // Study session complete - no more cards left
        console.log("Study session complete - no more cards to review");
        setTimeout(() => {
          router.push(`/decks`);
        }, 2000);
      }
    } catch (err) {
      console.error("Error rating card:", err);
      setError(err instanceof Error ? err.message : "Failed to rate card.");
    } finally {
      // Reset selected rating after a short delay to allow visual feedback
      setTimeout(() => setSelectedRating(null), 300);
    }
  };

  // Enhanced loading state
  if (authLoading || loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Preparing your study session...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen bg-background flex items-center justify-center p-4"
      >
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 max-w-md w-full">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <XCircle className="h-8 w-8 text-destructive" />
            </motion.div>
            <h2 className="text-xl font-bold text-card-foreground mb-2">
              Study Session Error
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/decks")}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Decks
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!deck) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen bg-background flex items-center justify-center p-4"
      >
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 max-w-md w-full">
          <div className="text-center">
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <h2 className="text-xl font-bold text-card-foreground mb-2">
              Deck Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              The study deck you&apos;re looking for doesn&apos;t exist.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/decks")}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Decks
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Study complete state with celebration
  if (cards.length === 0 && studyMode === "due") {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen bg-background"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-card rounded-2xl shadow-lg border border-border p-8 text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 1, delay: 0.5 }}
              className="w-24 h-24 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Award className="h-12 w-12 text-chart-2" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-card-foreground mb-3"
            >
              Congratulations! 🎉
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground mb-8 text-lg"
            >
              You&apos;ve completed all due cards in &quot;{deck.title}&quot;
            </motion.p>

            {/* Study session summary */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4 mb-8"
            >
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-chart-1 mb-1">
                  {studyStats.studiedCards}
                </div>
                <div className="text-sm text-muted-foreground">
                  Cards Studied
                </div>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-chart-2 mb-1">
                  {Math.floor(
                    (new Date().getTime() - sessionStartTime.getTime()) / 60000
                  )}
                  m
                </div>
                <div className="text-sm text-muted-foreground">Study Time</div>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-chart-3 mb-1">
                  {streak}
                </div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStudyMode("all");
                  setCards(allCards);
                  setCurrentCardIndex(0);
                  setStudyStats({
                    ...studyStats,
                    dueCards: allCards.length,
                    studiedCards: 0,
                    completionRate: 0,
                  });
                }}
                className="bg-chart-2 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Continue Studying All Cards
              </motion.button>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/decks")}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Back to Decks
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Session complete state
  if (currentCardIndex >= cards.length && cards.length > 0) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen bg-background"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-chart-2/10 border border-chart-2/20 rounded-2xl p-8 text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-20 h-20 bg-chart-2/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="h-10 w-10 text-chart-2" />
            </motion.div>
            <h3 className="text-2xl font-bold text-chart-2 mb-3">
              Study Session Complete!
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Amazing work! You&apos;ve reviewed all {studyStats.dueCards} cards
              in this session.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/decks")}
              className="bg-chart-2 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Decks
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-background"
    >
      {/* Enhanced Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card shadow-sm border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push("/decks")}
                className="mr-4 p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-muted-foreground" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground font-header">
                  {deck.title}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Study Session
                  {studyMode === "all" && " - All Cards"}
                </p>
              </div>
            </motion.div>

            {/* Enhanced Progress and Controls */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-6"
            >
              {/* Progress Stats */}
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {currentCardIndex + 1}/{cards.length}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Cards Progress
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-chart-2">
                  {studyStats.completionRate}%
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Complete
                </div>
              </div>

              {streak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-chart-4 flex items-center gap-1">
                    <Zap className="h-5 w-5" />
                    {streak}
                  </div>
                  <div className="text-sm text-muted-foreground">Streak</div>
                </motion.div>
              )}

              <DarkModeToggle />
            </motion.div>
          </div>

          {/* Enhanced Progress Bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-secondary/30 rounded-full h-2 mb-4"
          >
            <motion.div
              className="bg-gradient-to-r from-primary to-chart-2 h-2 rounded-full relative overflow-hidden"
              style={{
                width: `${((currentCardIndex + 1) / cards.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Enhanced Study Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {cards[currentCardIndex] && (
            <motion.div
              key={currentCardIndex}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative"
            >
              {/* Study Session Timer */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mb-6"
              >
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    {Math.floor(
                      (new Date().getTime() - sessionStartTime.getTime()) /
                        60000
                    )}
                    m elapsed
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {studyStats.studiedCards} completed
                  </div>
                </div>

                {cards[currentCardIndex].tags.length > 0 && (
                  <div className="flex gap-1">
                    {cards[currentCardIndex].tags
                      .slice(0, 3)
                      .map((tag, index) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                          className="px-2 py-1 bg-secondary/50 text-secondary-foreground text-xs rounded-full"
                        >
                          {tag}
                        </motion.span>
                      ))}
                  </div>
                )}
              </motion.div>

              <FlashcardReview
                card={cards[currentCardIndex]}
                onRate={handleRate}
                selectedRating={selectedRating}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
