type ShopData = {
    shop: string;
    accessToken: string;
    connectedAt: string;
  };
  
  const connectedShops: Record<string, ShopData> = {};
  
  export function saveShop(shop: string, token: string) {
    connectedShops[shop] = {
      shop,
      accessToken: token,
      connectedAt: new Date().toISOString(),
    };
  }
  
  export function getShop(shop: string) {
    return connectedShops[shop];
  }
  