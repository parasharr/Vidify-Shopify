import { NextRequest, NextResponse } from "next/server";
import { saveShop } from "@/lib/shopifyStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");

  if (!shop || !code)
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  const resp = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      code,
    }),
  });

  const data = await resp.json();

  if (!data.access_token) {
    return NextResponse.json({ error: "Token exchange failed", data });
  }

  saveShop(shop, data.access_token);

  return NextResponse.redirect(`/dashboard?shop=${shop}`);
}
