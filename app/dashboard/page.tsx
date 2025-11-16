"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  images?: string[];
  timestamp: Date;
  taskId?: string;
  videoUrls?: string[];
  watermarkUrls?: string[];
  status?: "pending" | "processing" | "success" | "failed";
};

type AspectRatio = "landscape" | "portrait" | "square";

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("landscape");
  const [isGenerating, setIsGenerating] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      pollingIntervalsRef.current.forEach((interval) => {
        clearInterval(interval);
      });
      pollingIntervalsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const addImageUrl = () => {
    const url = currentImageUrl.trim();
    if (!url) return;

    // Validate URL
    try {
      new URL(url);
      if (imageUrls.length < 3) {
        setImageUrls((prev) => [...prev, url]);
        setCurrentImageUrl("");
      }
    } catch (e) {
      // Invalid URL, show error or ignore
      alert("Please enter a valid image URL");
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addImageUrl();
    }
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmittingRef.current || isGenerating) return;
    if (!prompt.trim() && imageUrls.length === 0) return;

    const currentPrompt = prompt;
    const currentImageUrls = [...imageUrls];

    if (currentImageUrls.length === 0) {
      alert("Please add at least one image URL");
      return;
    }

    // Set flags immediately to prevent duplicate calls
    isSubmittingRef.current = true;
    setIsGenerating(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentPrompt || "Generate video from images",
      images: currentImageUrls,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setImageUrls([]);
    setCurrentImageUrl("");

    try {
      // Use the image URLs directly - no upload needed
      const validatedUrls = currentImageUrls.filter((url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });

      if (validatedUrls.length === 0) {
        throw new Error("No valid image URLs provided");
      }

      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentPrompt || "Create a smooth video animation",
          image_urls: validatedUrls,
          aspect_ratio: aspectRatio,
        }),
      });

      const data = await response.json();

      const taskId = data.taskId || data.job_id || data.task_id || data.data?.taskId;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: data.error ? "system" : "assistant",
        content: taskId
          ? `Video generation started! Checking status...`
          : data.error || data.message || "Video generation initiated successfully.",
        timestamp: new Date(),
        taskId: taskId,
        status: taskId ? "pending" : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Start polling for status if we have a taskId
      if (taskId) {
        startPollingStatus(taskId, assistantMessage.id);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: error instanceof Error 
          ? error.message 
          : "Failed to generate video. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      isSubmittingRef.current = false;
    }
  };

  const startPollingStatus = (taskId: string, messageId: string) => {
    // Clear any existing interval for this task
    const existingInterval = pollingIntervalsRef.current.get(taskId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Check status immediately
    checkVideoStatus(taskId, messageId);

    // Then poll every 5 seconds
    const interval = setInterval(() => {
      checkVideoStatus(taskId, messageId);
    }, 5000);

    pollingIntervalsRef.current.set(taskId, interval);
  };

  const checkVideoStatus = async (taskId: string, messageId: string) => {
    if (checkingStatus.has(taskId)) return;
    
    setCheckingStatus((prev) => new Set(prev).add(taskId));

    try {
      const response = await fetch(
        `/api/check-video-status?taskId=${taskId}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const state = data.state || data.data?.state;
      const resultUrls = data.resultUrls || [];
      const watermarkUrls = data.resultWaterMarkUrls || [];

      // Update the message with status and video URLs
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            let newContent = msg.content;
            let newStatus: "pending" | "processing" | "success" | "failed" = msg.status || "pending";

            if (state === "success" && resultUrls.length > 0) {
              newContent = "Video generation completed! 🎉";
              newStatus = "success";
              // Stop polling
              const interval = pollingIntervalsRef.current.get(taskId);
              if (interval) {
                clearInterval(interval);
                pollingIntervalsRef.current.delete(taskId);
              }
            } else if (state === "processing" || state === "pending") {
              newContent = "Video is being generated... Please wait.";
              newStatus = "processing";
            } else if (state === "failed" || data.failMsg) {
              newContent = `Video generation failed: ${data.failMsg || "Unknown error"}`;
              newStatus = "failed";
              // Stop polling on failure
              const interval = pollingIntervalsRef.current.get(taskId);
              if (interval) {
                clearInterval(interval);
                pollingIntervalsRef.current.delete(taskId);
              }
            }

            return {
              ...msg,
              content: newContent,
              status: newStatus,
              videoUrls: resultUrls,
              watermarkUrls: watermarkUrls,
            };
          }
          return msg;
        })
      );
    } catch (error) {
      console.error("Error checking video status:", error);
    } finally {
      setCheckingStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Prevent multiple rapid submissions
      if (!isSubmittingRef.current && !isGenerating) {
        handleSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Video Generator
      </h1>
                <p className="text-sm text-gray-500">Transform images into videos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 shadow-inner">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Start Creating Videos
              </h2>
              <p className="text-gray-500 max-w-md">
                Add 2-3 image URLs, add a prompt, and select an aspect ratio to
                generate stunning videos
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-4 duration-300`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${
                      message.type === "user"
                        ? "bg-gray-900 text-white"
                        : message.type === "assistant"
                        ? "bg-white border border-gray-200 text-gray-900"
                        : "bg-red-50 border border-red-200 text-red-900"
                    }`}
                  >
                    {message.images && message.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {message.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100"
                          >
                            <img
                              src={img}
                              alt={`Upload ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Display generated videos */}
                    {message.videoUrls && message.videoUrls.length > 0 && (
                      <div className="mb-3 space-y-3">
                        {message.videoUrls.map((videoUrl, idx) => (
                          <div
                            key={idx}
                            className="relative w-full rounded-lg overflow-hidden bg-gray-900"
                          >
                            <video
                              src={videoUrl}
                              controls
                              className="w-full h-auto"
                              style={{ maxHeight: "500px" }}
                            >
                              Your browser does not support the video tag.
                            </video>
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              ✓ Generated
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Display watermark videos if available */}
                    {message.watermarkUrls && message.watermarkUrls.length > 0 && (
                      <div className="mb-3 space-y-3">
                        <p className="text-xs text-gray-500 mb-2">With Watermark:</p>
                        {message.watermarkUrls.map((videoUrl, idx) => (
                          <div
                            key={idx}
                            className="relative w-full rounded-lg overflow-hidden bg-gray-900"
                          >
                            <video
                              src={videoUrl}
                              controls
                              className="w-full h-auto"
                              style={{ maxHeight: "500px" }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status indicator */}
                    {message.status && message.status !== "success" && (
                      <div className="mb-2 flex items-center gap-2">
                        {message.status === "processing" && (
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                          </div>
                        )}
                        {message.status === "pending" && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    )}

                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className="text-xs mt-2 opacity-60">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        Generating video...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200/80 bg-white/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Image URL Input Area */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URLs (up to 3)
            </label>
            
            {/* Display added URLs */}
            {imageUrls.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative group flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 pr-8"
          >
            <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-8 h-8 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-xs text-gray-600 truncate max-w-[200px]">
                      {url.length > 30 ? `${url.substring(0, 30)}...` : url}
                    </span>
                    <button
                      onClick={() => removeImageUrl(index)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-300 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* URL Input */}
            {imageUrls.length < 3 && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={currentImageUrl}
                  onChange={(e) => setCurrentImageUrl(e.target.value)}
                  onKeyDown={handleUrlKeyDown}
                  placeholder="Paste image URL here (e.g., https://example.com/image.jpg)"
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none bg-white text-gray-900 placeholder-gray-400 transition-all"
                />
                <button
                  onClick={addImageUrl}
                  disabled={!currentImageUrl.trim() || imageUrls.length >= 3}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Add
                </button>
              </div>
            )}
            
            {imageUrls.length >= 3 && (
              <p className="text-xs text-gray-500 mt-2">
                Maximum 3 images. Remove one to add another.
              </p>
            )}
          </div>

          {/* Aspect Ratio Selector */}
          <div className="mb-4 flex gap-2">
            {(["landscape", "portrait", "square"] as AspectRatio[]).map(
              (ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    aspectRatio === ratio
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {ratio.charAt(0).toUpperCase() + ratio.slice(1)}
                </button>
              )
            )}
          </div>

          {/* Prompt Input */}
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the video you want to create..."
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none resize-none bg-white text-gray-900 placeholder-gray-400 transition-all"
                style={{ minHeight: "48px", maxHeight: "200px" }}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                Press Enter to send
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!isSubmittingRef.current && !isGenerating) {
                  handleSubmit();
                }
              }}
              disabled={isSubmittingRef.current || isGenerating || (!prompt.trim() && imageUrls.length === 0)}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-md flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
