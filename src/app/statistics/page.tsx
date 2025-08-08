"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Award,
  Zap,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

interface Deck {
  _id: string;
  title: string;
  description: string;
  cardCount: number;
  lastStudied?: string;
  visibility: "private" | "friends" | "public";
}

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

interface StudyStats {
  totalCards: number;
  studiedCards: number;
  dueCards: number;
  completionRate: number;
  streak: number;
  totalStudyTime: number;
  averageEaseFactor: number;
  cardsByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentActivity: {
    date: string;
    cardsStudied: number;
  }[];
}

export default function StatisticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchStatistics();
    } else if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch user's decks
      const decksResponse = await fetch(`/api/decks?userId=${user?.uid}`);
      if (decksResponse.ok) {
        const decksData = await decksResponse.json();
        setDecks(decksData.decks || []);
      }

      // Fetch overall statistics
      const statsResponse = await fetch(`/api/stats?userId=${user?.uid}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (easeFactor: number) => {
    if (easeFactor >= 2.5) return "text-green-600";
    if (easeFactor >= 2.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getDifficultyLabel = (easeFactor: number) => {
    if (easeFactor >= 2.5) return "Easy";
    if (easeFactor >= 2.0) return "Medium";
    return "Hard";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Home
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
                onClick={() => router.push("/")}
                className="mr-4 p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground font-header">
                  Learning Statistics
                </h1>
                <p className="text-muted-foreground">Track your progress</p>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <>
            {/* Overview Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Cards
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalCards}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Studied Today
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.studiedCards}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Due Today
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.dueCards}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Streak</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.streak} days
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Progress and Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Completion Rate */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Completion Rate
                  </h3>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">
                    {stats.completionRate}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>

              {/* Average Ease Factor */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Average Ease Factor
                  </h3>
                </div>
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold mb-2 ${getDifficultyColor(
                      stats.averageEaseFactor
                    )}`}
                  >
                    {stats.averageEaseFactor.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getDifficultyLabel(stats.averageEaseFactor)} difficulty
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Cards by Difficulty */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
            >
              <div className="flex items-center mb-6">
                <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Cards by Difficulty
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.cardsByDifficulty.easy}
                  </div>
                  <div className="text-sm text-gray-600">Easy Cards</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {stats.cardsByDifficulty.medium}
                  </div>
                  <div className="text-sm text-gray-600">Medium Cards</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {stats.cardsByDifficulty.hard}
                  </div>
                  <div className="text-sm text-gray-600">Hard Cards</div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
            >
              <div className="flex items-center mb-6">
                <Activity className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700 font-medium">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-indigo-500 mr-2" />
                      <span className="text-gray-600">
                        {activity.cardsStudied} cards studied
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Deck Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center mb-6">
                <Zap className="h-6 w-6 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Deck Performance
                </h3>
              </div>
              <div className="space-y-4">
                {decks.map((deck) => (
                  <div
                    key={deck._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() =>
                      setSelectedDeck(
                        selectedDeck === deck._id ? null : deck._id
                      )
                    }
                  >
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-indigo-500 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {deck.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {deck.cardCount} cards
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Last studied
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {deck.lastStudied
                            ? new Date(deck.lastStudied).toLocaleDateString()
                            : "Never"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Visibility</div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {deck.visibility}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
