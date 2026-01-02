import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { updatePipelineItem, removeFromPipeline } from "@/lib/pipeline";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;
    const body = await request.json();
    const { status, priority, notes } = body;

    const result = await updatePipelineItem(itemId, user.id, {
      status,
      priority,
      notes,
    });

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating pipeline item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update pipeline item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;
    const result = await removeFromPipeline(itemId, user.id);

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error removing from pipeline:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from pipeline" },
      { status: 500 }
    );
  }
}
