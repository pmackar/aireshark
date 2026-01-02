import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { getUserWatchlist, addToWatchlist, type EntityType } from "@/lib/watchlist";

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const items = await getUserWatchlist(user.id);

    return NextResponse.json({
      success: true,
      data: items,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch watchlist" },
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
    const { entityType, entityId, notes, emailOnNewArticle, emailOnAcquisition } = body;

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

    const item = await addToWatchlist(user.id, entityType as EntityType, entityId, {
      notes,
      emailOnNewArticle,
      emailOnAcquisition,
    });

    return NextResponse.json({
      success: true,
      data: item,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}
