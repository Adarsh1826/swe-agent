import { qdrantclient } from "../utils/qdrant/index.js";
import { EmbeddedChunk } from "./embedder.js";
import { ChunkTypes } from "../types/rag-types/index.js";

export interface RetrievedChunk {
    chunk: ChunkTypes;
    score: number;
}
const COLLECTION_NAME = "code-chunks"

const VECTOR_SIZE = 1024

// first i will fetch all existing collection and check code-chunk is there or not

export async function ensureCollection(): Promise<void> {
    const collection = await qdrantclient.getCollections()
    const isExist = collection.collections.some(
        (c) => c.name === COLLECTION_NAME
    )
    // not exist
    if (!isExist) {
        await qdrantclient.createCollection(COLLECTION_NAME, {
            vectors: {
                size: VECTOR_SIZE,
                distance: "Cosine"
            }
        })
        console.log(`Collection created successfullt ${COLLECTION_NAME}`);

    }



}


// now done with collection ensure now store the embeding
export async function storeEmbeddings(
    embedded: EmbeddedChunk[]
): Promise<void> {
    await ensureCollection();

    const points = embedded.map((e, i) => ({
        id: i,
        vector: e.embedding,
        payload: {
            file: e.chunk.file,
            type: e.chunk.type,
            name: e.chunk.name,
            code: e.chunk.code,
            startLine: e.chunk.startLine,
            endLine: e.chunk.endLine,
            fileImports: e.chunk.fileImports ?? "",
        },
    }));

    await qdrantclient.upsert(COLLECTION_NAME, {
        wait: true,
        points,
    });

    console.log(`Stored ${embedded.length} chunks into Qdrant`);
}

// now i will call to find top first k

export async function retrieveTopK(
    issueEmbedding: number[],
    topK: number = 5
): Promise<RetrievedChunk[]>{
    const results = await qdrantclient.search(COLLECTION_NAME, {
        vector: issueEmbedding,
        limit: topK,
        with_payload: true
    })
    return results.map((r) => ({
        chunk: r.payload as unknown as ChunkTypes,
        score: r.score,
    }));
}