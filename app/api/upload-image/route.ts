import { NextRequest, NextResponse } from "next/server";

// Upload images to get HTTP URLs
// This converts base64 images to HTTP URLs that Kie AI API can accept
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body; // base64 image data

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // If it's already a URL, return it
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return NextResponse.json({ url: image });
    }

    // Extract base64 data (remove data:image/...;base64, prefix if present)
    let base64Data = image;
    let mimeType = "image/jpeg";
    
    if (image.includes(",")) {
      const parts = image.split(",");
      base64Data = parts[1];
      const mimeMatch = parts[0].match(/data:([^;]+)/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    } else if (image.startsWith("data:")) {
      const mimeMatch = image.match(/data:([^;]+)/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
      base64Data = image.replace(/^data:[^;]+;base64,/, "");
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Try ImgBB first (requires free API key - get from https://api.imgbb.com/)
    if (process.env.IMGBB_API_KEY) {
      try {
        const imgbbFormData = new FormData();
        imgbbFormData.append("key", process.env.IMGBB_API_KEY);
        imgbbFormData.append("image", base64Data);

        const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: imgbbFormData,
        });

        if (imgbbResponse.ok) {
          const imgbbData = await imgbbResponse.json();
          if (imgbbData.success && imgbbData.data?.url) {
            return NextResponse.json({ url: imgbbData.data.url });
          }
        }
      } catch (e) {
        console.log("ImgBB upload failed, trying Imgur...");
      }
    }

    // Try Imgur anonymous upload (no API key required, but rate limited)
    try {
      const imgurFormData = new FormData();
      imgurFormData.append("image", base64Data);
      imgurFormData.append("type", "base64");

      const imgurResponse = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: process.env.IMGUR_CLIENT_ID 
            ? `Client-ID ${process.env.IMGUR_CLIENT_ID}`
            : "Client-ID 546c25a59c58ad7", // Public anonymous client ID (rate limited)
        },
        body: imgurFormData,
      });

      if (imgurResponse.ok) {
        const imgurData = await imgurResponse.json();
        if (imgurData.success && imgurData.data?.link) {
          return NextResponse.json({ url: imgurData.data.link });
        }
      }
    } catch (e) {
      console.log("Imgur upload failed");
    }

    // If both fail, return error with setup instructions
    return NextResponse.json(
      {
        error: "Image upload service not configured or rate limited.",
        suggestion: "Please configure one of the following:\n1. Get a free API key from https://api.imgbb.com/ and add IMGBB_API_KEY to your .env file\n2. Get a client ID from https://api.imgur.com/oauth2/addclient and add IMGUR_CLIENT_ID to your .env file\n3. Or use direct HTTP URLs for images instead of uploading",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
