"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Sparkles,
  AlertCircle,
  Target,
} from "lucide-react";

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

interface FlashcardReviewProps {
  card: Card;
  onRate: (quality: number) => void;
  selectedRating?: number | null;
}

// Enhanced difficulty levels with improved design system
const difficultyLevels = [
  {
    value: 1,
    label: "Again",
    shortLabel: "Again",
    icon: RotateCcw,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
    hoverBg: "hover:bg-destructive/20",
    description: "I didn't know this at all",
    interval: "< 1m",
  },
  {
    value: 2,
    label: "Hard",
    shortLabel: "Hard",
    icon: AlertCircle,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    borderColor: "border-chart-4/20",
    hoverBg: "hover:bg-chart-4/20",
    description: "I knew it with difficulty",
    interval: "< 6m",
  },
  {
    value: 3,
    label: "Good",
    shortLabel: "Good",
    icon: Target,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    borderColor: "border-chart-1/20",
    hoverBg: "hover:bg-chart-1/20",
    description: "I knew it well",
    interval: "1-3d",
  },
  {
    value: 4,
    label: "Easy",
    shortLabel: "Easy",
    icon: Sparkles,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    borderColor: "border-chart-2/20",
    hoverBg: "hover:bg-chart-2/20",
    description: "I knew it perfectly",
    interval: "4d+",
  },
];

// Animation variants for enhanced UX
const cardVariants = {
  question: {
    rotateY: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  answer: {
    rotateY: 180,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const buttonVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
  hover: {
    scale: 1.05,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
  selected: {
    scale: 1.1,
    y: -4,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
};

const staggerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

export default function FlashcardReview({
  card,
  onRate,
  selectedRating,
}: FlashcardReviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    // Reset state when card changes
    setIsFlipped(false);
    setShowAnswer(false);
  }, [card._id]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

  const handleRate = (quality: number) => {
    console.log(
      `FlashcardReview: Rating button clicked with quality ${quality}`
    );
    setTimeout(() => {
      console.log(`FlashcardReview: Calling onRate with quality ${quality}`);
      onRate(quality);
    }, 300);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto"
    >
      {/* Enhanced Flashcard */}
      <motion.div
        variants={staggerVariants}
        className="relative mb-8"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          variants={cardVariants}
          animate={isFlipped ? "answer" : "question"}
          whileHover="hover"
          onClick={handleFlip}
          className="relative w-full min-h-[400px] cursor-pointer group"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Question Side */}
          <motion.div
            className="absolute inset-0 w-full h-full backface-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div className="bg-card rounded-2xl shadow-lg border border-border p-8 h-full flex flex-col justify-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-chart-2/5 rounded-full translate-y-12 -translate-x-12" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Question</span>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="bg-primary/10 p-2 rounded-lg"
                  >
                    <Eye className="h-5 w-5 text-primary" />
                  </motion.div>
                </div>

                <h2 className="text-2xl font-bold text-card-foreground mb-4 leading-relaxed">
                  {card.question}
                </h2>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center mt-8 text-muted-foreground"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-center"
                  >
                    <div className="text-sm font-medium mb-2">
                      Click to reveal answer
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <RotateCcw className="h-4 w-4" />
                      <span className="text-xs">Tap anywhere</span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Answer Side */}
          <motion.div
            className="absolute inset-0 w-full h-full backface-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
            }}
          >
            <div className="bg-card rounded-2xl shadow-lg border border-border p-8 h-full flex flex-col justify-center relative overflow-hidden">
              {/* Background decoration - different from question side */}
              <div className="absolute top-0 left-0 w-28 h-28 bg-chart-2/5 rounded-full -translate-y-14 -translate-x-14" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-full translate-y-10 translate-x-10" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>Answer</span>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="bg-chart-2/10 p-2 rounded-lg"
                  >
                    <EyeOff className="h-5 w-5 text-chart-2" />
                  </motion.div>
                </div>

                <div className="text-xl text-card-foreground leading-relaxed">
                  {card.answer}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 text-center text-muted-foreground"
                >
                  <div className="text-sm font-medium mb-2">
                    How well did you know this?
                  </div>
                  <div className="flex items-center gap-2 justify-center text-xs">
                    <Target className="h-3 w-3" />
                    <span>Rate your confidence below</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Enhanced Rating Buttons - Following Fitts's Law with larger, well-spaced buttons */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            variants={staggerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            {/* Progress indicator */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full bg-secondary/30 rounded-full h-1 mb-6"
            >
              <motion.div
                className="bg-gradient-to-r from-primary to-chart-2 h-1 rounded-full"
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </motion.div>

            {/* Desktop layout - 2x2 grid for better button sizing */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
              {difficultyLevels.map((level, index) => (
                <motion.button
                  key={level.value}
                  variants={buttonVariants}
                  initial="initial"
                  animate={
                    selectedRating === level.value ? "selected" : "animate"
                  }
                  whileHover={selectedRating === null ? "hover" : undefined}
                  whileTap={selectedRating === null ? "tap" : undefined}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    console.log(
                      `Button clicked for quality ${level.value}, disabled: ${
                        selectedRating !== null
                      }`
                    );
                    if (selectedRating === null) {
                      handleRate(level.value);
                    }
                  }}
                  disabled={selectedRating !== null}
                  className={`
                    group relative p-6 rounded-2xl border-2 transition-all duration-300
                    ${level.bgColor} ${level.borderColor} ${
                    selectedRating === null ? level.hoverBg : ""
                  }
                    ${
                      selectedRating === level.value
                        ? "ring-4 ring-primary/20 shadow-lg"
                        : ""
                    }
                    ${
                      selectedRating !== null && selectedRating !== level.value
                        ? "opacity-50"
                        : ""
                    }
                    disabled:cursor-not-allowed
                    focus:outline-none focus:ring-4 focus:ring-primary/20
                  `}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={
                        selectedRating === level.value ? { rotate: 360 } : {}
                      }
                      transition={{ duration: 0.5 }}
                      className={`p-3 rounded-xl ${level.bgColor} ${level.color}`}
                    >
                      <level.icon className="h-6 w-6" />
                    </motion.div>

                    <div className="text-left flex-1">
                      <div className={`text-lg font-bold ${level.color} mb-1`}>
                        {level.label}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {level.description}
                      </div>
                      <div
                        className={`text-xs font-medium ${level.color} opacity-70`}
                      >
                        Next review: {level.interval}
                      </div>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {selectedRating === level.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3"
                    >
                      <CheckCircle className="h-5 w-5 text-chart-2" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Mobile layout - single column with compact buttons */}
            <div className="md:hidden space-y-3">
              {difficultyLevels.map((level, index) => (
                <motion.button
                  key={level.value}
                  variants={buttonVariants}
                  initial="initial"
                  animate={
                    selectedRating === level.value ? "selected" : "animate"
                  }
                  whileHover={selectedRating === null ? "hover" : undefined}
                  whileTap={selectedRating === null ? "tap" : undefined}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    if (selectedRating === null) {
                      handleRate(level.value);
                    }
                  }}
                  disabled={selectedRating !== null}
                  className={`
                    group relative w-full p-4 rounded-xl border transition-all duration-300
                    ${level.bgColor} ${level.borderColor} ${
                    selectedRating === null ? level.hoverBg : ""
                  }
                    ${
                      selectedRating === level.value
                        ? "ring-2 ring-primary/20 shadow-md"
                        : ""
                    }
                    ${
                      selectedRating !== null && selectedRating !== level.value
                        ? "opacity-50"
                        : ""
                    }
                    disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-primary/20
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${level.bgColor} ${level.color}`}
                    >
                      <level.icon className="h-5 w-5" />
                    </div>

                    <div className="text-left flex-1">
                      <div className={`font-bold ${level.color}`}>
                        {level.shortLabel}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {level.interval}
                      </div>
                    </div>

                    {selectedRating === level.value && (
                      <CheckCircle className="h-4 w-4 text-chart-2" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Progress feedback */}
            {selectedRating !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                  />
                  <span>Processing your response...</span>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts hint */}
      {!showAnswer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-secondary rounded text-xs">
                Space
              </kbd>
              <span>Flip card</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-secondary rounded text-xs">1-4</kbd>
              <span>Rate difficulty</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
