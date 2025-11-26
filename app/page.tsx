"use client";
import { useState } from "react";
import Navbar from "./components/Navbar";
import ConnectModal from "./components/ConnectModel";

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-40">
        <h1 className="text-5xl font-extrabold text-gray-900 text-center">
          Revolutionize Your Shopify Product Videos with AI
        </h1>
        <p className="text-gray-600 mt-4 max-w-xl text-center">
          Generate stunning product videos in minutes — powered by AI.
        </p>

        <button
          onClick={() => setOpen(true)}
          className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
        >
          Connect to Shopify
        </button>
      </div>

      <ConnectModal open={open} onCloseAction={() => setOpen(false)} />
    </div>
  );
}
