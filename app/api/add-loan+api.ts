import { LRUCache } from "lru-cache";
import { prisma } from "../../utils/db";

// LRU cache for recent loan creations (by user or IP)
const cache = new LRUCache<string, boolean>({
  max: 100,
  ttl: 1000 * 60 * 60 * 24 * 30,
});

export async function POST(req: Request) {
  // Parse JSON body
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use userId or fallback to empty string for cache key
  const cacheKey = body.userId || "";
  if (cache.get(cacheKey)) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please wait before adding another loan.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const {
      borrowerName,
      borrowerPhone,
      amount,
      interestRate,
      interestRateType,
      startDate,
      notes,
      paymentMode,
      paymentProofUri,
      paymentProofType,
      paymentProofName,
      paymentProofData, // base64 or binary data for PDF/image
      loanPurpose,
      bankAccount,
      status,
      userId, // Add userId to destructuring
    } = body;

    // Basic validation
    if (
      !borrowerName ||
      !amount ||
      !interestRate ||
      !interestRateType ||
      !startDate ||
      !userId // Require userId
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields including userId." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let paymentProofUriToStore = paymentProofUri;
    if (paymentProofData) {
      try {
        const file = await prisma.paymentProof.create({
          data: {
            name: paymentProofName,
            type: paymentProofType,
            data: Buffer.from(paymentProofData, "base64"),
            createdAt: new Date(),
          },
        });
        paymentProofUriToStore = `/api/payment-proof/${file.id}`;
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Failed to store payment proof file." }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const loan = await prisma.loan.create({
      data: {
        borrowerName,
        borrowerPhone,
        amount: parseFloat(amount),
        interestRate: parseFloat(interestRate),
        interestRateType,
        startDate: new Date(startDate),
        notes,
        paymentMode,
        paymentProofUri: paymentProofUriToStore,
        paymentProofType,
        paymentProofName,
        loanPurpose,
        bankAccount,
        status: status || "active",
        userId, // Add userId to the data
      },
    });

    cache.set(cacheKey, true);
    return new Response(JSON.stringify({ loan }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return new Response(
        JSON.stringify({ error: "A loan with these details already exists." }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

//
