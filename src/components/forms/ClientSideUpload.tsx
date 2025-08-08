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
  Eye,
  Brain,
} from "lucide-react";
import {
  extractTextFromImage,
  generateFlashcardsFromText,
} from "@/lib/ocr/text-extractor";

interface QAPair {
  question: string;
  answer: string;
}

interface ClientSideUploadProps {
  onUploadComplete: (qaPairs: QAPair[]) => void;
  onClose: () => void;
}

export default function ClientSideUpload({
  onUploadComplete,
  onClose,
}: ClientSideUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
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
    ];

    if (!supportedTypes.includes(file.type)) {
      setError("Please select an image file (JPEG, PNG, GIF, BMP, WebP)");
      return;
    }

    console.log(
      "Starting client-side processing:",
      file.name,
      file.type,
      file.size
    );
    setIsProcessing(true);
    setError(null);

    try {
      // Extract text using Tesseract.js
      console.log("Extracting text from image...");
      const ocrResult = await extractTextFromImage(file);

      if (!ocrResult.text || ocrResult.text.length < 10) {
        throw new Error(
          "No readable text found in the image. Please try a clearer image."
        );
      }

      setExtractedText(ocrResult.text);
      console.log("Text extracted:", ocrResult.text.substring(0, 100) + "...");

      // Generate flashcards from extracted text
      console.log("Generating flashcards...");
      const generatedPairs = await generateFlashcardsFromText(
        ocrResult.text,
        8
      );

      if (generatedPairs.length === 0) {
        throw new Error(
          "Could not generate flashcards from the extracted text. Please try a different image."
        );
      }

      setQaPairs(generatedPairs);
      setStep("review");
      console.log("Flashcards generated:", generatedPairs.length);
    } catch (err) {
      console.error("Processing error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during processing"
      );
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

  const handleRegenerateCards = async () => {
    if (!extractedText) return;

    setIsProcessing(true);
    try {
      const newPairs = await generateFlashcardsFromText(extractedText, 8);
      setQaPairs(newPairs);
    } catch (err) {
      setError("Failed to regenerate flashcards");
    } finally {
      setIsProcessing(false);
    }
  };

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
              <h2 className="text-2xl font-bold text-gray-900">
                📸 Client-Side Image Processing
              </h2>
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
                  <p className="text-gray-600 mb-4">
                    Upload an image of your handwritten notes to create
                    flashcards
                    <br />
                    <span className="text-sm text-blue-600">
                      ✨ Processing happens in your browser - no server upload
                      needed!
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Upload Image
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Drag and drop or click to upload an image
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
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
                    <p className="text-gray-600">
                      Processing image with OCR...
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === "review" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Review Generated Flashcards
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleRegenerateCards}
                      disabled={isProcessing}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                    >
                      <Brain className="h-4 w-4 inline mr-1" />
                      Regenerate
                    </button>
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
                  </div>
                </div>

                {/* Extracted Text Preview */}
                {extractedText && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Eye className="h-4 w-4 text-gray-600 mr-2" />
                      <h4 className="font-medium text-gray-900">
                        Extracted Text
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                      {extractedText.substring(0, 300)}
                      {extractedText.length > 300 && "..."}
                    </p>
                  </div>
                )}

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
                        <button
                          onClick={() => handleRemoveQA(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
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
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
