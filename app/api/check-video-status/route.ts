import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.KIE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Kie AI Status API Error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to check video status",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Parse the resultJson if it exists
    let parsedResult = null;
    const resultJson = data.data?.resultJson || data.resultJson;
    if (resultJson) {
      try {
        parsedResult = typeof resultJson === 'string' 
          ? JSON.parse(resultJson) 
          : resultJson;
      } catch (e) {
        console.error("Failed to parse resultJson:", e);
      }
    }

    const state = data.data?.state || data.state;
    const responseTaskId = data.data?.taskId || data.taskId || taskId;

    return NextResponse.json({
      success: true,
      code: data.code,
      message: data.message,
      taskId: responseTaskId,
      state: state,
      resultUrls: parsedResult?.resultUrls || [],
      resultWaterMarkUrls: parsedResult?.resultWaterMarkUrls || [],
      completeTime: data.data?.completeTime,
      createTime: data.data?.createTime,
      updateTime: data.data?.updateTime,
      failCode: data.data?.failCode || data.failCode,
      failMsg: data.data?.failMsg || data.failMsg,
      ...data,
    });
  } catch (error) {
    console.error("Video status check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check video status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

