"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { products } from "../products";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const product = products.find((p) => p.slug === slug);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [customSettings, setCustomSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Product not found
      </div>
    );
  }

  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(product.price),
    [product.price]
  );

  const selectedImage = product.images[selectedImageIndex];

  // ⭐ FIXED FUNCTION
  async function handleGenerateVideo() {
    setLoading(true);

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a product video for ${product?.title ?? ""}. Price ${formattedPrice}.`,
          imageUrl: selectedImage?.src ?? "",
        }),
      });

      const data = await res.json();

      const taskId = data?.data?.taskId;

      if (!taskId) {
        alert("No taskId returned.");
        return;
      }

      // ⭐ CORRECT REDIRECT
      router.push(`/video/${taskId}`);
    } catch (err) {
      alert("Something went wrong: " + err);
    }

    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1>{product.title}</h1>

      <button
        onClick={handleGenerateVideo}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "Generating..." : "Generate Video"}
      </button>
    </div>
  );
}
