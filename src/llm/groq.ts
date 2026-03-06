import Groq from "groq-sdk";
import { CustomError } from "../utils/constructor/error.js";
const GROQ_API_KEY = process.env.GROQ_API_KEY!
if(!GROQ_API_KEY){
    throw new CustomError({
        statusCode:400,
        message:"Groq api key is missing"
    })
}

export const groqClient = new Groq({
    apiKey:GROQ_API_KEY
})