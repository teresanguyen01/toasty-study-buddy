"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Save, BookOpen } from "lucide-react";

interface QAPair {
  question: string;
  answer: string;
}

interface ManualFlashcardFormProps {
  onComplete: (qaPairs: QAPair[]) => void;
  onClose: () => void;
}

export default function ManualFlashcardForm({
  onComplete,
  onClose,
}: ManualFlashcardFormProps) {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([
    { question: "", answer: "" },
  ]);

  const addCard = () => {
    setQaPairs([...qaPairs, { question: "", answer: "" }]);
  };

  const removeCard = (index: number) => {
    if (qaPairs.length > 1) {
      setQaPairs(qaPairs.filter((_, i) => i !== index));
    }
  };

  const updateCard = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    const updatedPairs = [...qaPairs];
    updatedPairs[index] = {
      ...updatedPairs[index],
      [field]: value,
    };
    setQaPairs(updatedPairs);
  };

  const handleSave = () => {
    const validPairs = qaPairs.filter(
      (pair) => pair.question.trim() && pair.answer.trim()
    );
    if (validPairs.length > 0) {
      onComplete(validPairs);
    }
  };

  const isValid = qaPairs.some(
    (pair) => pair.question.trim() && pair.answer.trim()
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Flashcards Manually
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Type your questions and answers to create custom flashcards
                </p>
              </div>

              <div className="space-y-4">
                {qaPairs.map((qa, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">
                        Card {index + 1}
                      </h4>
                      {qaPairs.length > 1 && (
                        <button
                          onClick={() => removeCard(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question
                        </label>
                        <textarea
                          value={qa.question}
                          onChange={(e) =>
                            updateCard(index, "question", e.target.value)
                          }
                          placeholder="Enter your question here..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer
                        </label>
                        <textarea
                          value={qa.answer}
                          onChange={(e) =>
                            updateCard(index, "answer", e.target.value)
                          }
                          placeholder="Enter your answer here..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={addCard}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Card
                </button>

                <button
                  onClick={handleSave}
                  disabled={!isValid}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Deck (
                  {
                    qaPairs.filter((p) => p.question.trim() && p.answer.trim())
                      .length
                  }{" "}
                  cards)
                </button>
              </div>

              {!isValid && (
                <p className="text-sm text-gray-500 text-center">
                  Add at least one question and answer to save your deck
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
