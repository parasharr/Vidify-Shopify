import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop)
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });

  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const scopes = process.env.SHOPIFY_SCOPES;

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;

  return NextResponse.redirect(authUrl);
}
