import { createllmClient } from "../llm/client.js";
import { buildPrompt } from "./promptbuilder.js";
import { RetrievedChunk } from "./retreiver.js";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CustomError } from "../utils/constructor/error.js";

export interface LLMFix {
  filePath: string;
  fixedCode: string;
}

const parseResponse = (raw: string): LLMFix => {
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

export async function callLLM(
  issue: string,
  chunks: RetrievedChunk[]
): Promise<LLMFix> {
  const prompt = buildPrompt(issue, chunks);
  const { provider, client } = await createllmClient(1);

  switch (provider) {
    case "groq": {
      const res = await (client as Groq).chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
      });
      return parseResponse(res.choices[0].message.content ?? "");
    }

    case "openai": {
      const res = await (client as OpenAI).chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
       
      });
      return parseResponse(res.choices[0].message.content ?? "");
    }

    case "gemini": {
      const model = (client as GoogleGenerativeAI).getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      const res = await model.generateContent(prompt);
      return parseResponse(res.response.text());
    }

    default:
      throw new CustomError({
        statusCode: 400,
        message: "Unsupported provider",
      });
  }
}