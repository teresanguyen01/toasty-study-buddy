"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  Plus,
  Camera,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Users,
  Trophy,
  LogOut,
  User,
  Upload,
  BarChart3,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/forms/LoginForm";
import RegisterForm from "@/components/forms/RegisterForm";
import EnhancedAIUpload from "@/components/forms/EnhancedAIUpload";
import CreateDeckForm from "@/components/forms/CreateDeckForm";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { useDecks } from "@/contexts/DecksContext";

interface QAPair {
  question: string;
  answer: string;
}

interface Deck {
  _id: string;
  title: string;
  description: string;
  cardCount: number;
  lastStudied?: string;
  visibility: "private" | "friends" | "public";
}

interface StudyStats {
  dueCards: number;
  totalCards: number;
  studiedCards: number;
  completionRate: number;
}

// Animation variants for consistent motion design
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: { scale: 0.98 },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
};

export default function HomePage() {
  const { user, userProfile, loading, error, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null);
  const [showEnhancedAI, setShowEnhancedAI] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const { decks, loading: decksLoading, refreshDecks } = useDecks();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [stats, setStats] = useState<StudyStats>({
    dueCards: 0,
    totalCards: 0,
    studiedCards: 0,
    completionRate: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      setShowAuth("login");
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      refreshDecks();
    }
  }, [user, refreshDecks]);

  const fetchUserData = async () => {
    setIsDataLoading(true);
    try {
      // Fetch study statistics
      const statsResponse = await fetch(`/api/stats?userId=${user?.uid}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(null);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleEnhancedAIComplete = (qaPairs: QAPair[]) => {
    setShowEnhancedAI(false);
    // TODO: Create a new deck with the generated Q/A pairs
    console.log("Enhanced AI completed with Q/A pairs:", qaPairs);
  };

  const handleCreateDeckSuccess = (deckId: string) => {
    setShowCreateDeck(false);
    fetchUserData(); // Refresh data to show new deck
    console.log("Deck created successfully:", deckId);
  };

  // Loading state with smooth shimmer effect
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-primary border-t-transparent"
        />
      </div>
    );
  }

  // Error state with better visual hierarchy
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-background flex items-center justify-center p-4"
      >
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 max-w-md w-full">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Zap className="h-8 w-8 text-destructive" />
            </motion.div>
            <h2 className="text-xl font-bold text-card-foreground mb-2">
              Connection Error
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Retry Connection
              </motion.button>
              <p className="text-sm text-muted-foreground">
                If the problem persists, check your internet connection
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Authentication forms with improved animations
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {showAuth === "login" && (
            <motion.div
              key="login"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <LoginForm
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setShowAuth("register")}
              />
            </motion.div>
          )}
          {showAuth === "register" && (
            <motion.div
              key="register"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setShowAuth("login")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background"
    >
      {/* Enhanced Header with subtle animations */}
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
              <motion.div
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-lg mr-3"
              >
                <Zap className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground font-header">
                Toasty&apos;s Study Buddy
              </h1>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2 px-3 py-2 bg-secondary/50 rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium text-sm">
                  {userProfile?.name || user.displayName || user.email}
                </span>
              </div>
              <DarkModeToggle />
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleLogout}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Section with better typography hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text font-header">
            Welcome back, {userProfile?.name || user.displayName || "Student"}!
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="inline-block ml-2"
            >
              👋
            </motion.span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Ready to boost your learning with spaced repetition?
          </p>
        </motion.div>

        {/* Enhanced Quick Actions with improved spacing and animations */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          {/* Create Custom Deck Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            className="group bg-card rounded-2xl shadow-sm border border-border p-8 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => setShowCreateDeck(true)}
          >
            <div className="flex items-center mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-xl shadow-sm"
              >
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                  Create Custom Deck
                </h3>
                <p className="text-sm text-muted-foreground">
                  Build personalized flashcards
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Design your own flashcards with custom questions and answers
              tailored to your learning goals.
            </p>
            <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform">
              <span>Get Started</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </div>
          </motion.div>

          {/* Enhanced AI Processing Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            className="group bg-card rounded-2xl shadow-sm border border-border p-8 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => setShowEnhancedAI(true)}
          >
            <div className="flex items-center mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="bg-gradient-to-br from-chart-2 to-chart-2/80 p-4 rounded-xl shadow-sm"
              >
                <Brain className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-card-foreground group-hover:text-chart-2 transition-colors">
                  Enhanced AI Processing
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload & AI-generate content
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Upload images or PDFs and let AI automatically generate
              flashcards, summaries, or Q&A pairs.
            </p>
            <div className="flex items-center text-chart-2 font-medium group-hover:translate-x-2 transition-transform">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Upload Content</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </div>
          </motion.div>
        </motion.div>

        {/* Study Statistics with improved visual hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground font-header">
              Your Progress
            </h3>
            <Link href="/statistics">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                View Statistics
              </motion.button>
            </Link>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              {
                label: "Due Today",
                value: stats.dueCards,
                icon: Clock,
                color: "text-chart-1",
                bgColor: "bg-chart-1/10",
              },
              {
                label: "Total Cards",
                value: stats.totalCards,
                icon: Target,
                color: "text-chart-2",
                bgColor: "bg-chart-2/10",
              },
              {
                label: "Studied",
                value: stats.studiedCards,
                icon: TrendingUp,
                color: "text-chart-3",
                bgColor: "bg-chart-3/10",
              },
              {
                label: "Completion",
                value: `${stats.completionRate}%`,
                icon: Trophy,
                color: "text-chart-4",
                bgColor: "bg-chart-4/10",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-card rounded-xl shadow-sm border border-border p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                  className={`${stat.bgColor} p-3 rounded-lg w-fit mx-auto mb-3`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                    {isDataLoading ? (
                      <div className="h-7 w-8 bg-muted animate-pulse rounded mx-auto" />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Recent Decks Section with enhanced cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground font-header">
              Your Decks
            </h3>
            <Link href="/decks">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </div>

          {isDataLoading || decksLoading ? (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  variants={cardVariants}
                  className="bg-card rounded-xl shadow-sm border border-border p-6"
                >
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : decks.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {decks.slice(0, 6).map((deck, index) => (
                <motion.div
                  key={deck._id}
                  variants={cardVariants}
                  whileHover="hover"
                  className="group bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {deck.title}
                    </h4>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="bg-primary/10 p-2 rounded-lg"
                    >
                      <BookOpen className="h-4 w-4 text-primary" />
                    </motion.div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {deck.description || "No description available"}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {deck.cardCount} cards
                    </span>
                    <Link href={`/study/${deck._id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium transition-colors text-xs"
                      >
                        Study Now
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </motion.div>
              <h4 className="text-xl font-bold text-foreground mb-2">
                No decks yet
              </h4>
              <p className="text-muted-foreground mb-6">
                Create your first deck to start learning!
              </p>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setShowCreateDeck(true)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First Deck
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Access Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Chat",
              href: "/chat",
              icon: Brain,
              color: "text-chart-1",
            },
            {
              label: "Decks",
              href: "/decks",
              icon: BookOpen,
              color: "text-chart-2",
            },
            {
              label: "Statistics",
              href: "/statistics",
              icon: BarChart3,
              color: "text-chart-3",
            },
            {
              label: "Upload",
              action: () => setShowEnhancedAI(true),
              icon: Upload,
              color: "text-chart-4",
            },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className="group bg-card rounded-xl shadow-sm border border-border p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => (item.action ? item.action() : null)}
            >
              {item.href ? (
                <Link href={item.href} className="block">
                  <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors"
                    >
                      <item.icon
                        className={`h-6 w-6 ${item.color} group-hover:text-primary transition-colors`}
                      />
                    </motion.div>
                    <span className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
                      {item.label}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors"
                  >
                    <item.icon
                      className={`h-6 w-6 ${item.color} group-hover:text-primary transition-colors`}
                    />
                  </motion.div>
                  <span className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Modals with improved animations */}
      <AnimatePresence>
        {showEnhancedAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) =>
              e.target === e.currentTarget && setShowEnhancedAI(false)
            }
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              <EnhancedAIUpload
                onUploadComplete={handleEnhancedAIComplete}
                onClose={() => setShowEnhancedAI(false)}
              />
            </motion.div>
          </motion.div>
        )}

        {showCreateDeck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) =>
              e.target === e.currentTarget && setShowCreateDeck(false)
            }
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-lg"
            >
              <CreateDeckForm
                onSuccess={handleCreateDeckSuccess}
                onClose={() => setShowCreateDeck(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
