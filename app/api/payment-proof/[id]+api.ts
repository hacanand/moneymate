import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

// Define the GET handler for the API route
export async function GET(req: Request) {
  // Ensure the request method is GET
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  // Extract the file ID from query parameters
  const url = new URL(req.url);
  const id = "684547ea57b42c2dfdc9a855";
    // url.searchParams.get("id");

  // Validate the ID
  if (!id  ) {
    return NextResponse.json(
      { error: "Missing or invalid file ID." },
      { status: 400 }
    );
  }

  try {
    // Fetch the file from MongoDB via Prisma
    const file = await prisma.paymentProof.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    // Convert MongoDB binary data to Buffer
    const fileBuffer = Buffer.from(file.data.buffer);

    // Set response headers and return the file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": file.type || "application/pdf", // Default to PDF
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          file.name
        )}"`,
        "Access-Control-Allow-Origin": "*", // Allow CORS for mobile app
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  } catch (error: any) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch file." },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
