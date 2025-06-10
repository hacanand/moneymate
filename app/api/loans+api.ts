import { LRUCache } from "lru-cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../utils/db";

// LRU cache for recent loan fetches
const cache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export async function GET(req: NextRequest) {
  // Use userId from query or header
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  // Use userId as cache key
  if (cache.has(userId)) {
    return NextResponse.json({ loans: cache.get(userId), cached: true });
  }
  try {
    const loans = await prisma.loan.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
    });
    cache.set(userId, loans);
    return NextResponse.json({ loans });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch loans" },
      { status: 500 }
    );
  }
}
