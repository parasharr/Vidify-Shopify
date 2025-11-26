import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/verifyWebhook";
import { deleteShop } from "@/lib/shopifyStore";

export async function POST(req: NextRequest) {
  const hmac = req.headers.get("X-Shopify-Hmac-SHA256") || "";
  const body = await req.text();

  if (!verifyWebhook(hmac, body))
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });

  const payload = JSON.parse(body);

  // delete all data for that shop
  await deleteShop(payload.shop_domain);

  return NextResponse.json({ success: true });
}
