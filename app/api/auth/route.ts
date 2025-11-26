// app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

function normalizeShop(raw: string): string | null {
  let shop = raw.trim().toLowerCase();

  // handle admin.shopify URL
  const match = shop.match(/store\/([a-z0-9-]+)/i);
  if (match) shop = match[1];

  // remove protocol
  shop = shop.replace(/^https?:\/\//, "").replace(/\/.*/, "");

  // enforce myshopify.com
  if (!shop.endsWith(".myshopify.com")) {
    shop = `${shop}.myshopify.com`;
  }

  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(shop)) return null;
  return shop;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("shop");
  if (!raw) return NextResponse.json({ error: "Missing shop" }, { status: 400 });

  const shop = normalizeShop(raw);
  if (!shop) return NextResponse.json({ error: "Invalid Shopify store name" }, { status: 400 });

  const state = crypto.randomUUID();

  const authUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${process.env.SHOPIFY_CLIENT_ID}` +
    `&scope=${process.env.SHOPIFY_SCOPES}` +
    `&redirect_uri=${encodeURIComponent(process.env.SHOPIFY_REDIRECT_URI!)}` +
    `&state=${state}` +
    `&grant_options[]=per-user`;

  return NextResponse.redirect(authUrl);
}
