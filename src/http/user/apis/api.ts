// this file contain function to add  , delete , see all api provided by user

// fisrt function to add the api key

import { FastifyRequest, FastifyReply } from "fastify";
import { AddApiKeyBody } from "../../../types/http";
import { CustomError } from "../../../utils/constructor/error.js";
import { encrypt } from "../../../algorithm/encryption-decryption/index.js";
import { prisma } from "../../../utils/db/db.js";

export const addApiKey = async (req:FastifyRequest<{ Body: AddApiKeyBody }>,res:FastifyReply)=>{
    // extracting the content from the req 
   
    const {providerName,apiKey} =  req.body ;
    if(!providerName || !apiKey){
        throw new CustomError({
            message:"Credentails is missing",
            statusCode:"400"
        })
    }

    const encryptedKey = encrypt(apiKey);

    // now i will save into the db safelt
    const saved = await prisma.apis.create({
        data:{
            providerName,
            apiKey:encryptedKey.content,
            iv:encryptedKey.iv
        }
    })
    console.log(saved);

    return res.status(200).send({
        message:"API key saved securely",
        id:saved.id
    })

}