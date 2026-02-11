export interface GeminiUpdatedFile {
  path: string;
  content: string;
}

export interface GeminiResponse {
  text: string;
  updatedFiles: GeminiUpdatedFile[];
}
