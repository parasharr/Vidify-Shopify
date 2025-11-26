import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/verifyWebhook";

export async function POST(req: NextRequest) {
  const hmac = req.headers.get("X-Shopify-Hmac-SHA256") || "";
  const body = await req.text();

  if (!verifyWebhook(hmac, body))
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });

  const payload = JSON.parse(body);

  // TODO: return customer data you store (if any)
  // Shopify just checks that you return 200
  return NextResponse.json({ success: true });
}
