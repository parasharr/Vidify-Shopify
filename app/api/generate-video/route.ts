import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, imageUrl } = body;

    const response = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.KIE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sora-2-text-to-video",
        callBackUrl: "https://your-domain.com/api/callback", // or leave blank for now
        input: {
          prompt,
          aspect_ratio: "landscape",
          n_frames: "10",
          remove_watermark: true,
        }
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate video", details: error },
      { status: 500 }
    );
  }
}
