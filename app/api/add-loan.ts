import { LRUCache } from "lru-cache";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../utils/db";

// LRU cache for recent loan creations (by user or IP)
const cache = new LRUCache<string, boolean>({
  max: 100,
  ttl: 1000 * 60 * 60 * 24 * 30,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Use userId or IP as cache key (adjust as needed)
  const cacheKey = req.body.userId || req.socket.remoteAddress || "";
  if (cache.get(cacheKey)) {
    return res.status(429).json({
      error: "Too many requests. Please wait before adding another loan.",
    });
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
       
    } = req.body;

    // Basic validation
    if (
      !borrowerName ||
      !amount ||
      !interestRate ||
      !interestRateType ||
      !startDate 
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let paymentProofUriToStore = paymentProofUri;
    if (paymentProofData) {
      // Store the file in MongoDB's GridFS or as a Buffer field (for demo, store as Buffer in a separate collection)
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
        return res
          .status(500)
          .json({ error: "Failed to store payment proof file." });
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
      },
    });

    cache.set(cacheKey, true);
    return res.status(201).json({ loan });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "A loan with these details already exists." });
    }
    // Prisma validation or other errors
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
