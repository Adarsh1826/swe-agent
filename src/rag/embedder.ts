const { VoyageAIClient } = await import("voyageai");
import { CustomError } from "../utils/constructor/error.js";
import { ChunkTypes } from "../types/rag-types/index.js";
import { EmbeddedChunk } from "../types/rag-types/index.js";
const key = process.env.VOYAGE_API_KEY
if (!key) {
    throw new CustomError({
        statusCode: 404,
        message: "Key is missing for embeeding"
    })
}
const voyage = new VoyageAIClient({ apiKey: key })

// first i will embed the issue

export async function embedIssue(text: string): Promise<number[]> {
    const result = await voyage.embed({
        input: [text],
        model: 'voyage-code-3'
    })
    console.log(Object.keys(result.data![0]));
    return result.data![0].embedding as number[]

}
// i will embed the chukns
export async function embedChunk(chunks: ChunkTypes[]): Promise<EmbeddedChunk[]> {

    const texts = chunks.map((c) => `
File: ${c.file}
Imports: ${c.fileImports ?? ""}
Type: ${c.type}
Name: ${c.name}
Lines: ${c.startLine}-${c.endLine}
Code:
${c.code}
`.trim());

    const result = await voyage.embed({
        input: texts,
        model: 'voyage-code-3'
    })
    return chunks.map((chunk, i) => ({
        chunk,
        embedding: result.data![i].embedding!,
    }));
}