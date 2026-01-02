import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { getPipelineWithItems, updatePipeline, deletePipeline } from "@/lib/pipeline";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const pipeline = await getPipelineWithItems(id, user.id);

    if (!pipeline) {
      return NextResponse.json({ success: false, error: "Pipeline not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: pipeline,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching pipeline:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pipeline" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, color } = body;

    const result = await updatePipeline(id, user.id, {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(color !== undefined && { color }),
    });

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Pipeline not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating pipeline:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update pipeline" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await deletePipeline(id, user.id);

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Pipeline not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error deleting pipeline:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete pipeline" },
      { status: 500 }
    );
  }
}
