import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../utils/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName, imageUrl } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing userId or email" },
        { status: 400 }
      );
    }
    // Check if user profile exists
    let profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      // Create new profile
      profile = await prisma.userProfile.create({
        data: { userId, email, fullName, imageUrl },
      });
    }
    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create or fetch user profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
