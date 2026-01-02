import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { addToPipeline, type EntityType } from "@/lib/pipeline";
import prisma from "@/lib/db";

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

    const pipeline = await prisma.pipeline.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!pipeline) {
      return NextResponse.json({ success: false, error: "Pipeline not found" }, { status: 404 });
    }

    const items = await prisma.pipelineItem.findMany({
      where: { pipelineId: id },
      include: {
        privateEquityFirm: { select: { name: true, slug: true } },
        platform: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
      orderBy: [{ status: "asc" }, { addedAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: items,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching pipeline items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pipeline items" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const pipeline = await prisma.pipeline.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!pipeline) {
      return NextResponse.json({ success: false, error: "Pipeline not found" }, { status: 404 });
    }

    const body = await request.json();
    const { entityType, entityId, status, priority, notes } = body;

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, error: "entityType and entityId are required" },
        { status: 400 }
      );
    }

    if (!["firm", "platform", "brand"].includes(entityType)) {
      return NextResponse.json(
        { success: false, error: "Invalid entityType" },
        { status: 400 }
      );
    }

    const item = await addToPipeline(id, user.id, entityType as EntityType, entityId, {
      status,
      priority,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: item,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error adding to pipeline:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to pipeline" },
      { status: 500 }
    );
  }
}
