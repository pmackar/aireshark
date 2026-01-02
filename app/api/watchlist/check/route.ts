import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { isEntityWatched, type EntityType } from "@/lib/watchlist";

export async function POST(request: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { entityType, entityId } = body;

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

    const result = await isEntityWatched(user.id, entityType as EntityType, entityId);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check watchlist" },
      { status: 500 }
    );
  }
}
