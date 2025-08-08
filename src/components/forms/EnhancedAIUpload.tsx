"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  Check,
  AlertCircle,
  Loader2,
  FileText,
  Brain,
  BookOpen,
  MessageSquare,
  Zap,
} from "lucide-react";

interface QAPair {
  question: string;
  answer: string;
}

interface EnhancedAIUploadProps {
  onUploadComplete: (qaPairs: QAPair[]) => void;
  onClose: () => void;
}

type ProcessingType = "flashcards" | "summary" | "qa_generation";

export default function EnhancedAIUpload({
  onUploadComplete,
  onClose,
}: EnhancedAIUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] =
    useState<ProcessingType>("flashcards");
  const [extractedText, setExtractedText] = useState<string>("");
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [keyPoints, setKeyPoints] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "processing" | "review">(
    "upload"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = async (file: File) => {
    const supportedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "application/pdf",
    ];

    if (!supportedTypes.includes(file.type)) {
      setError(
        "Please select an image file (JPEG, PNG, GIF, BMP, WebP) or PDF"
      );
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    // Check if file is empty
    if (file.size === 0) {
      setError("File is empty. Please select a valid file.");
      return;
    }

    console.log(
      "Starting enhanced AI processing:",
      file.name,
      file.type,
      file.size
    );
    setIsProcessing(true);
    setError(null);

    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      const response = await fetch("/api/ai-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: base64,
          contentType: file.type,
          processingType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process image");
      }

      const result = await response.json();
      console.log("AI processing result:", result);

      if (!result.isValid) {
        throw new Error("Failed to process image with AI");
      }

      if (processingType === "flashcards") {
        setExtractedText(result.extractedText || "");
        setQaPairs(result.qaPairs || []);
      } else if (processingType === "summary") {
        setSummary(result.summary || "");
        setKeyPoints(result.keyPoints || "");
      } else if (processingType === "qa_generation") {
        setQaPairs(result.qaPairs || []);
      }

      setStep("review");
    } catch (err) {
      console.error("Processing error:", err);

      if (
        err instanceof Error &&
        err.message.includes("The requested file could not be read")
      ) {
        setError(
          "File access error: The file could not be read. Please try with a different file or check file permissions."
        );
      } else if (
        err instanceof Error &&
        err.message.includes("Failed to fetch")
      ) {
        setError(
          "Connection error: Unable to reach the server. Please check if the server is running and try again."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred during AI processing"
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
            await handleFileUpload(file);
          }
        }, "image/jpeg");
      }
    }
  };

  const handleSaveCards = () => {
    onUploadComplete(qaPairs);
  };

  const handleEditQA = (
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

  const handleAddQA = () => {
    setQaPairs([...qaPairs, { question: "", answer: "" }]);
  };

  const handleRemoveQA = (index: number) => {
    const updatedPairs = qaPairs.filter((_, i) => i !== index);
    setQaPairs(updatedPairs);
  };

  const getProcessingTypeInfo = () => {
    switch (processingType) {
      case "flashcards":
        return {
          title: "AI Flashcard Generation",
          description: "Create intelligent flashcards from your notes",
          icon: <BookOpen className="h-6 w-6" />,
          color: "blue",
        };
      case "summary":
        return {
          title: "AI Content Summary",
          description: "Get a comprehensive summary of your notes",
          icon: <MessageSquare className="h-6 w-6" />,
          color: "green",
        };
      case "qa_generation":
        return {
          title: "AI Practice Questions",
          description: "Generate practice questions from your content",
          icon: <Zap className="h-6 w-6" />,
          color: "purple",
        };
    }
  };

  const typeInfo = getProcessingTypeInfo();

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
                <Brain className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {typeInfo.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {step === "upload" && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">{typeInfo.description}</p>
                </div>

                {/* Processing Type Selection */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Choose Processing Type:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        type: "flashcards" as ProcessingType,
                        label: "Flashcards",
                        icon: <BookOpen className="h-4 w-4" />,
                      },
                      {
                        type: "summary" as ProcessingType,
                        label: "Summary",
                        icon: <MessageSquare className="h-4 w-4" />,
                      },
                      {
                        type: "qa_generation" as ProcessingType,
                        label: "Practice Q&A",
                        icon: <Zap className="h-4 w-4" />,
                      },
                    ].map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setProcessingType(option.type)}
                        className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                          processingType === option.type
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {option.icon}
                        <span className="ml-2">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Upload Image
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Upload an image or PDF for AI processing
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </div>

                  {/* Camera Capture */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Take Photo
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Use your camera to capture notes
                    </p>
                    <button
                      onClick={handleCameraCapture}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Open Camera
                    </button>
                  </div>
                </div>

                {/* Camera Interface */}
                {videoRef.current?.srcObject && (
                  <div className="border rounded-lg p-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="text-center mt-4">
                      <button
                        onClick={capturePhoto}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Capture Photo
                      </button>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-indigo-600" />
                    <p className="text-gray-600">Processing with AI...</p>
                  </div>
                )}
              </div>
            )}

            {step === "review" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Review AI Results
                  </h3>
                  <div className="flex space-x-2">
                    {processingType === "flashcards" && (
                      <>
                        <button
                          onClick={handleAddQA}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Add Card
                        </button>
                        <button
                          onClick={handleSaveCards}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Save Deck
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Extracted Text Preview */}
                {extractedText && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Extracted Text
                    </h4>
                    <p className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                      {extractedText.substring(0, 300)}
                      {extractedText.length > 300 && "..."}
                    </p>
                  </div>
                )}

                {/* Summary Results */}
                {processingType === "summary" && summary && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Summary
                      </h4>
                      <p className="text-sm text-blue-800">{summary}</p>
                    </div>
                    {keyPoints && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">
                          Key Points
                        </h4>
                        <p className="text-sm text-green-800">{keyPoints}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Flashcards/QA Results */}
                {qaPairs.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      {processingType === "flashcards"
                        ? "Generated Flashcards"
                        : "Practice Questions"}
                    </h4>
                    {qaPairs.map((qa, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">
                            {processingType === "flashcards"
                              ? `Card ${index + 1}`
                              : `Question ${index + 1}`}
                          </h5>
                          {processingType === "flashcards" && (
                            <button
                              onClick={() => handleRemoveQA(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
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
                                handleEditQA(index, "question", e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
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
                                handleEditQA(index, "answer", e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
