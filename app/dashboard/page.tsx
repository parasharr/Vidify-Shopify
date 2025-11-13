"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { type Product, products as dummyProducts } from "./products";

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get("shop");

    if (shopParam) {
      setShop(shopParam);
    }

    setProducts(dummyProducts);
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Products {shop ? `(${shop})` : ""}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-gray-100 shadow-sm p-4 rounded-xl flex flex-col"
          >
            <img
              src={p.images[0]?.src}
              alt={p.images[0]?.alt}
              className="h-40 object-cover w-full rounded-lg"
            />
            <h2 className="font-semibold mt-4 text-gray-800">{p.title}</h2>
            <p className="text-sm text-gray-500 mt-1">${p.price.toFixed(2)}</p>
            <Link
              href={`/dashboard/${p.slug}`}
              className="mt-4 inline-flex justify-center items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 rounded-lg transition"
            >
              Generate Video
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
