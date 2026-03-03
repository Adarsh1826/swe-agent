import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../../utils/db/db.js";
import { CustomError } from "../../../utils/constructor/error.js";

interface DeleteParams {
  id: string; 
}

export const deleteUserApiKey = async (
  req: FastifyRequest<{ Params: DeleteParams }>,
  res: FastifyReply
) => {
  const { id } = req.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    throw new CustomError({
      message: "Invalid API key id",
      statusCode: "400",
    });
  }

  const userId = (req as any).user?.id;
  const guestId = req.headers["x-guest-id"] as string;

  if (!userId && !guestId) {
    throw new CustomError({
      message: "Unauthorized",
      statusCode: "401",
    });
  }

  const existing = await prisma.apis.findFirst({
    where: userId
      ? { id: numericId, userId }
      : { id: numericId, guestId },
  });

  if (!existing) {
    throw new CustomError({
      message: "API key not found",
      statusCode: "404",
    });
  }

  // Delete
  await prisma.apis.delete({
    where: { id: numericId },
  });

  return res.status(200).send({
    message: "API key deleted successfully",
  });
};