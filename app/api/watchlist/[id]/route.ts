import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { removeFromWatchlist } from "@/lib/watchlist";
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

    const item = await prisma.watchlistItem.findFirst({
      where: { id, userId: user.id },
      include: {
        privateEquityFirm: true,
        platform: true,
        brand: true,
      },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: item,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching watchlist item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch watchlist item" },
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
    const { notes, emailOnNewArticle, emailOnAcquisition } = body;

    const result = await prisma.watchlistItem.updateMany({
      where: { id, userId: user.id },
      data: {
        ...(notes !== undefined && { notes }),
        ...(emailOnNewArticle !== undefined && { emailOnNewArticle }),
        ...(emailOnAcquisition !== undefined && { emailOnAcquisition }),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating watchlist item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update watchlist item" },
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
    const result = await removeFromWatchlist(id, user.id);

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}
