import { LRUCache } from "lru-cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../utils/db";

// LRU cache for recent loan fetches
const cache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export async function GET(req: NextRequest) {
  // Use IP as cache key (or userId if available)
  const cacheKey =   req.headers.get("x-forwarded-for") || "default";
  if (cache.has(cacheKey)) {
    return NextResponse.json({ loans: cache.get(cacheKey), cached: true });
  }
  try {
    const loans = await prisma.loan.findMany({
      orderBy: { startDate: "desc" },
    });
    cache.set(cacheKey, loans);
    return NextResponse.json({ loans });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch loans" },
      { status: 500 }
    );
  }
}
