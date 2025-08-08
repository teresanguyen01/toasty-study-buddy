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
} from "lucide-react";

interface QAPair {
  question: string;
  answer: string;
}

interface NoteUploadProps {
  onUploadComplete: (qaPairs: QAPair[]) => void;
  onClose: () => void;
}

export default function NoteUpload({
  onUploadComplete,
  onClose,
}: NoteUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
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

    console.log("Starting file upload:", file.name, file.type, file.size);
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Get the current URL to determine the correct port
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/process-file`;

      console.log("Sending request to:", apiUrl);
      console.log("Current window location:", window.location.href);
      console.log("File being uploaded:", file.name, file.type, file.size);
      console.log(
        "FormData entries:",
        Array.from(formData.entries()).map(
          ([key, value]) =>
            `${key}: ${value instanceof File ? value.name : value}`
        )
      );

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(30000), // 30 second timeout
        // Don't set Content-Type header - let the browser set it automatically for FormData
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(
          `Failed to process file: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Response result:", result);

      if (!result.isValid) {
        setError(result.suggestions?.[0] || "Failed to process file with AI");
        setIsUploading(false);
        return;
      }

      // Use the Q/A pairs directly from OpenAI
      setQaPairs(result.qaPairs);
      setStep("review");
    } catch (err) {
      console.error("Upload error:", err);

      // Handle network errors specifically
      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        setError(
          "Connection error: Unable to reach the server. Please check if the server is running and try again."
        );
      } else if (err instanceof Error && err.name === "AbortError") {
        setError(
          "Request timeout: The upload took too long. Please try again with a smaller file."
        );
      } else if (
        err instanceof Error &&
        err.message.includes("The requested file could not be read")
      ) {
        setError(
          "File access error: The file could not be read. Please try with a different file or check file permissions."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred during file processing"
        );
      }
    } finally {
      setIsUploading(false);
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
                Upload Notes & Create Flashcards
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
                    Upload an image of your handwritten notes or a PDF document
                    to create flashcards
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Upload File
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Drag and drop or click to upload an image or PDF
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

                {(isUploading || isProcessing) && (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-indigo-600" />
                    <p className="text-gray-600">
                      {isUploading
                        ? "Uploading and processing..."
                        : "Generating flashcards..."}
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
