import { db } from "./firebaseAdmin";

export async function saveShop(shop: string, token: string) {
  await db.collection("shops").doc(shop).set({
    accessToken: token,
    shop,
    connectedAt: new Date().toISOString(),
  });
}

export async function getShop(shop: string) {
  const docSnap = await db.collection("shops").doc(shop).get();
  return docSnap.exists ? docSnap.data() : null;
}

export async function deleteShop(shop: string) {
  await db.collection("shops").doc(shop).delete();
}
