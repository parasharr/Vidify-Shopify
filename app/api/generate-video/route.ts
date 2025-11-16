import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, image_urls, aspect_ratio } = body;

    // Validate required fields
    if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Get the callback URL - use the current domain or a placeholder
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const callBackUrl = `${origin}/api/callback`;

    // Prepare the request body according to Kie AI API format
    const requestBody = {
      model: "sora-2-image-to-video",
      callBackUrl: callBackUrl,
      input: {
        prompt: prompt || "Create a smooth video animation",
        image_urls: image_urls,
        aspect_ratio: aspect_ratio || "landscape",
        n_frames: "10",
        remove_watermark: true,
      },
    };

    const response = await fetch(
      "https://api.kie.ai/api/v1/jobs/createTask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.KIE_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Kie AI API Error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to generate video",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract taskId from various possible response formats
    const taskId = data.data?.taskId || data.taskId || data.job_id || data.task_id || data.id;
    
    // Return the response with taskId
    return NextResponse.json({
      success: true,
      taskId: taskId,
      job_id: taskId, // Keep for backward compatibility
      ...data,
    });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate video",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
