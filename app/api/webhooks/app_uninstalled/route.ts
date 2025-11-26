import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/verifyWebhook";
import { deleteShop } from "@/lib/shopifyStore";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");

  // must validate
  if (!verifyWebhook(hmac ?? "", rawBody)) {
    return new NextResponse("Invalid HMAC", { status: 200 });
    // yes — return 200 anyway
  }

  const payload = JSON.parse(rawBody);
  const shop = payload.myshopify_domain;

  try {
    await deleteShop(shop);
  } catch (e) {
    console.error("Delete failed:", e);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
