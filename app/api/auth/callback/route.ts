import { NextRequest, NextResponse } from "next/server";

const API_VERSION = "2024-10";

async function registerWebhook(shop: string, token: string, topic: string, address: string) {
  return fetch(`https://${shop}/admin/api/${API_VERSION}/webhooks.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      webhook: {
        topic,
        address,
        format: "json",
      },
    }),
  }).then(r => r.json());
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const shop = params.get("shop");
  const code = params.get("code");

  if (!shop || !code)
    return NextResponse.json({ error: "Missing OAuth params" }, { status: 400 });

  // Exchange code → access token
  const accessTokenResponse = await fetch(`https://${shop}/admin/oauth/access_token.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_CLIENT_ID!,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET!,
      code,
    }),
  });

  const tokenData = await accessTokenResponse.json();

  if (!tokenData.access_token) {
    return NextResponse.json({ error: "Token exchange failed", details: tokenData }, { status: 500 });
  }

  const token = tokenData.access_token;

  // Register compliance webhooks
  const APP_URL = process.env.APP_URL!;
  await Promise.all([
    registerWebhook(shop, token, "app/uninstalled", `${APP_URL}/api/webhooks/app_uninstalled`),
    registerWebhook(shop, token, "customers/data_request", `${APP_URL}/api/webhooks/customers_data_request`),
    registerWebhook(shop, token, "customers/redact", `${APP_URL}/api/webhooks/customers_redact`),
    registerWebhook(shop, token, "shop/redact", `${APP_URL}/api/webhooks/shop_redact`),
  ]);

  // Redirect to UI
  return NextResponse.redirect(`${APP_URL}/dashboard?shop=${shop}`);
}
