import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { getUserPipelines, createPipeline } from "@/lib/pipeline";

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const pipelines = await getUserPipelines(user.id);

    return NextResponse.json({
      success: true,
      data: pipelines,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching pipelines:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pipelines" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Pipeline name is required" },
        { status: 400 }
      );
    }

    const pipeline = await createPipeline(user.id, {
      name: name.trim(),
      description: description?.trim(),
      color,
    });

    return NextResponse.json({
      success: true,
      data: pipeline,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating pipeline:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create pipeline" },
      { status: 500 }
    );
  }
}
