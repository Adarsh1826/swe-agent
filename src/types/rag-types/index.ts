export interface FileLookupInterface {
  owner: string;
  repo: string;
  issueData: {
    number: number;
    title: string;
    body: string;
    labels?: string[];
    author: string;
    url?: string;
  };
}


export type ChunkTypes = {
  file: string;
  name: string;
  type: "function" | "class";
  code: string;
  fileImports?: string;   
  startLine?: number;     
  endLine?: number;
};

export interface EmbeddedChunk {
  chunk: ChunkTypes;
  embedding: number[];
}