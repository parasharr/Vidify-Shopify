import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/lib/shopifyStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop)
    return NextResponse.json({ error: "Missing shop" }, { status: 400 });

  const shopData = getShop(shop);
  if (!shopData)
    return NextResponse.json({ error: "Shop not connected" }, { status: 401 });

  const resp = await fetch(`https://${shop}/admin/api/2024-10/products.json`, {
    headers: {
      "X-Shopify-Access-Token": shopData.accessToken,
    },
  });

  const data = await resp.json();
  return NextResponse.json(data.products || []);
}
