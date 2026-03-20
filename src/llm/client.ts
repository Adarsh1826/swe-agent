import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { CustomError } from "../utils/constructor/error.js";
import { prisma } from "../utils/db/db.js";
import { decrypt } from "../algorithm/encryption-decryption/index.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY!
export const createllmClient = async (userId: number): Promise<{
    provider: "groq" | "gemini" | "openai"
    client: Groq | OpenAI | GoogleGenerativeAI
}> => {

    // i will find is
    //  there any active key 
    const isActive = await prisma.apis.findFirst({
        where: {
            userId: (userId),
            activeKey: true
        }
    })
    if (!isActive) {
        // not active
        // now i will crate throught mine
        // i will use groq only in free tier
        if (!GROQ_API_KEY) {
            throw new CustomError({
                statusCode: 400,
                message: "Groq key is missing in .env"
            })

        }
        return { provider: "groq", client: new Groq({ apiKey: GROQ_API_KEY }) }

    }

    const key = decrypt(isActive.apiKey, isActive?.iv)
    // now i will check for provider name
    const providerName = isActive.providerName;
    // now i will use provider name sdk
    switch (providerName) {
        case "gemini":
            console.log("Active User llm client createSuccesfuuly");
            return { provider: "gemini", client: new GoogleGenerativeAI(key) }
            
        case "openai":
            console.log("Active User llm client createSuccesfuuly");
            return { provider: "openai", client: new OpenAI({ apiKey: key }) }
           
        default:
            console.log("Not  createSuccesfuuly");
            throw new CustomError({
                statusCode: 400,
                message: `Unsupported provider: ${providerName}`
            })

    }

}

// righr now  to keep server awakes and code clen

export const groqClient = new Groq({ apiKey: GROQ_API_KEY })