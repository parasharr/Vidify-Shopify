"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface VideoData {
  videoUrl1080: string;
  videoUrl720: string;
  title: string;
  productName: string;
  duration: number;
  createdAt: string;
}

export default function VideoPreviewPage() {
  const { id } = useParams<{ id: string }>();

  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<"1080p" | "720p">("1080p");
  const [loadingMessage, setLoadingMessage] = useState("Processing your video...");

  useEffect(() => {
    if (!id) return;
  
    async function fetchStatus() {
      const res = await fetch(`/api/video?id=${id}`);
      const data = await res.json();
  
      console.log("API STATUS:", data);
  
      // Keep polling while generating
      if (data.data?.state === "generating" || data.data?.state === "processing") {
        setTimeout(fetchStatus, 3000);
        return;
      }
  
      // When completed
      if (data.data?.state === "success") {
  
        // resultJson may come empty first — wait for real data
        if (!data.data.resultJson) {
          console.log("resultJson empty, retrying...");
          setTimeout(fetchStatus, 2000);
          return;
        }
  
        let result;
        try {
          result = JSON.parse(data.data.resultJson);
        } catch (err) {
          console.log("Failed to parse JSON, retrying...");
          setTimeout(fetchStatus, 2000);
          return;
        }
  
        setVideoData({
          videoUrl1080: result.resultUrls?.[0] ?? "",
          videoUrl720: result.resultWaterMarkUrls?.[0] ?? "",
          title: "AI Generated Video",
          productName: "Generated Product",
          duration: 5,
          createdAt: new Date().toISOString(),
        });
  
        return;
      }
  
      // Error case
      if (data.data?.state === "fail") {
        console.log("Video generation failed:", data.data.failMsg);
      }
    }
  
    fetchStatus();
  }, [id]);
  

  // Loading screen
  if (!videoData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        {loadingMessage}
      </div>
    );
  }

  // Choose quality
  const videoUrl =
    selectedQuality === "1080p"
      ? videoData.videoUrl1080
      : videoData.videoUrl720;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <Link href="/videos" className="hover:text-gray-700">
            My Videos
          </Link>{" "}
          / <span className="text-gray-400">{videoData.productName}</span> /{" "}
          <span className="text-gray-400">Review & Publish</span>
        </div>

        {/* Video Player */}
        <div className="bg-black rounded-xl overflow-hidden shadow-lg">
          <video
            src={videoUrl}
            className="w-full"
            controls
            autoPlay
            style={{ minHeight: 380 }}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-semibold mt-6 text-gray-900">
          {videoData.title}
        </h1>

        {/* Details */}
        <div className="mt-3 space-y-1 text-gray-600 text-sm">
          <p><strong>Product:</strong> {videoData.productName}</p>
          <p><strong>Duration:</strong> {videoData.duration} seconds</p>
          <p><strong>Generated on:</strong> {videoData.createdAt}</p>
        </div>

        {/* Resolution Switch */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setSelectedQuality("1080p")}
            className={`px-4 py-2 rounded-md text-sm border ${
              selectedQuality === "1080p"
                ? "bg-cyan-500 text-white border-cyan-600"
                : "bg-white border-gray-300 text-gray-700"
            }`}
          >
            1080p
          </button>

          <button
            onClick={() => setSelectedQuality("720p")}
            className={`px-4 py-2 rounded-md text-sm border ${
              selectedQuality === "720p"
                ? "bg-cyan-500 text-white border-cyan-600"
                : "bg-white border-gray-300 text-gray-700"
            }`}
          >
            720p
          </button>
        </div>

        {/* Download Button */}
        <button
          onClick={() => window.open(videoUrl, "_blank")}
          className="w-full mt-8 bg-cyan-500 text-white font-semibold py-3 rounded-lg shadow hover:bg-cyan-600 transition flex items-center justify-center gap-2"
        >
          <span>⬇</span> Download MP4
        </button>
      </div>
    </div>
  );
}
