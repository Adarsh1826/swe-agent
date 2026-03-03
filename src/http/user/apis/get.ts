import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../../utils/db/db.js";
import { CustomError } from "../../../utils/constructor/error.js";

export const getUserApiKeys = async (
  req: FastifyRequest,
  res: FastifyReply
) => {

  const userId = (req as any).user?.id;
  const guestId = req.headers["x-guest-id"] as string;

  if (!userId && !guestId) {
    throw new CustomError({
      message: "Unauthorized",
      statusCode: "401",
    });
  }

  const apis = await prisma.apis.findMany({
    where: userId
      ? { userId }
      : { guestId },
    select: {
      id: true,
      providerName: true,
    },
  });

  return res.status(200).send({
    message: "API keys fetched successfully",
    data: apis,
  });
};