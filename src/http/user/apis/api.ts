// // this file contain function to add  , delete , see all api provided by user

// // fisrt function to add the api key

// import { FastifyRequest, FastifyReply } from "fastify";
// import { AddApiKeyBody } from "../../../types/http";
// import { CustomError } from "../../../utils/constructor/error.js";
// import { encrypt } from "../../../algorithm/encryption-decryption/index.js";
// import { prisma } from "../../../utils/db/db.js";

// export const addApiKey = async (req:FastifyRequest<{ Body: AddApiKeyBody }>,res:FastifyReply)=>{
//     // extracting the content from the req 
   
//     const {providerName,apiKey} =  req.body ;
//     if(!providerName || !apiKey){
//         throw new CustomError({
//             message:"Credentails is missing",
//             statusCode:"400"
//         })
//     }

//     const encryptedKey = encrypt(apiKey);

//     // now i will save into the db safelt
//     const saved = await prisma.apis.create({
//         data:{
//             providerName,
//             apiKey:encryptedKey.content,
//             iv:encryptedKey.iv
//         }
//     })
//     console.log(saved);

//     return res.status(200).send({
//         message:"API key saved securely",
//         id:saved.id
//     })

// }


import { FastifyRequest, FastifyReply } from "fastify";
import { AddApiKeyBody } from "../../../types/http";
import { CustomError } from "../../../utils/constructor/error.js";
import { encrypt } from "../../../algorithm/encryption-decryption/index.js";
import { prisma } from "../../../utils/db/db.js";

export const addApiKey = async (
  req: FastifyRequest<{ Body: AddApiKeyBody }>,
  res: FastifyReply
) => {

  const { providerName, apiKey } = req.body;

  const userId = (req as any).user?.id;
  const guestId = req.headers["x-guest-id"] as string;

  if (!providerName || !apiKey) {
    throw new CustomError({
      message: "Credentails is missing",
      statusCode: "400",
    });
  }

  if (!userId && !guestId) {
    throw new CustomError({
      message: "Unauthorized",
      statusCode: "401",
    });
  }

  const encryptedKey = encrypt(apiKey);

  const saved = await prisma.apis.create({
    data: {
      providerName,
      apiKey: encryptedKey.content,
      iv: encryptedKey.iv,
      userId: userId ?? undefined,
      guestId: guestId ?? undefined,
    },
  });

  return res.status(200).send({
    message: "API key saved securely",
    id: saved.id,
  });
};