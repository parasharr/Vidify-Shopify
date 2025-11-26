import crypto from "crypto";

export function verifyWebhook(hmac: string, body: string) {
  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET!)
    .update(body, "utf8")
    .digest("base64");

  return hash === hmac;
}
