import { prisma } from "@/utils/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
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
    // MongoDB binary data fix: file.data is a Buffer-like object
    const fileBuffer = Buffer.from(file.data.buffer);
    res.setHeader("Content-Type", file.type || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.name)}"`
    );
    res.status(200).send(fileBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch file." });
  }
}
