export interface GeminiUpdatedFile {
  path: string;
  content: string;
}

export interface GeminiResponse {
  updatedFiles: GeminiUpdatedFile[];
}
