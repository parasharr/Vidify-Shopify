"use client";

import { useState } from "react";

export default function ConnectModal({
  open,
  onCloseAction,
}: {
  open: boolean;
  onCloseAction: () => void;
}) {
  const [shop, setShop] = useState("");
  const [error, setError] = useState("");

  const handleConnect = () => {
    if (!shop.trim()) {
      setError("Please enter your Shopify store name");
      return;
    }

    let input = shop.trim().toLowerCase();

    // 1️⃣ Strip full admin URL
    // Example: admin.shopify.com/store/kamakart-toys/whatever
    const match = input.match(/store\/([a-z0-9-]+)/i);
    if (match && match[1]) {
      input = match[1]; // → "kamakart-toys"
    }

    // 2️⃣ Remove https:// or http://
    input = input.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    // 3️⃣ Remove .myshopify.com if typed
    input = input.replace(".myshopify.com", "");

    // 4️⃣ Final shop domain
    const formattedShop = `${input}.myshopify.com`;

    // 5️⃣ Validate (only letters numbers and hyphens)
    if (!/^[a-z0-9-]+\.myshopify\.com$/.test(formattedShop)) {
      setError("Invalid Shopify domain");
      return;
    }

    // 6️⃣ Redirect to Shopify OAuth
    window.location.href = `/api/auth?shop=${formattedShop}`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <button
          onClick={onCloseAction}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Connect Your Shopify Store
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your Shopify store name (e.g. <b>mystore</b> or{" "}
          <b>mystore.myshopify.com</b>).
        </p>

        <input
          type="text"
          value={shop}
          onChange={(e) => {
            setShop(e.target.value);
            setError("");
          }}
          placeholder="e.g. mystore or mystore.myshopify.com"
          className={`w-full border ${
            error ? "border-red-400" : "border-gray-300"
          } rounded-lg p-3 focus:ring-2 focus:ring-cyan-600 outline-none`}
        />

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}

        <button
          onClick={handleConnect}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 mt-5 rounded-lg font-semibold transition"
        >
          Connect to Shopify
        </button>
      </div>
    </div>
  );
}
