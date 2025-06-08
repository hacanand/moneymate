import { prisma } from "@/utils/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid file id." });
  }

  try {
    const file = await prisma.paymentProof.findUnique({
      where: { id },
    });
    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    res.setHeader("Content-Type", file.type || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.name)}"`
    );
    res.status(200).send(Buffer.from(file.data));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch file." });
  }
}
