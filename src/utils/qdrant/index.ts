import { QdrantClient } from "@qdrant/js-client-rest";
import { CustomError } from "../constructor/error.js";

// first i need to set up my cleint
const QDRANT_URL = process.env.QDRANT_URL!
const QDRANT_API_KEY = process.env.QDRANT_API_KEY!
if(!QDRANT_URL || !QDRANT_API_KEY){
    throw new CustomError({
        statusCode:404,
        message:"Missing qdrant credentials"
    })

}

export const qdrantclient = new QdrantClient({
    url:QDRANT_URL,
    apiKey:QDRANT_API_KEY
})