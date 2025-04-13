import { createMistral } from "@ai-sdk/mistral";
import { LanguageModel } from "ai";
import dotenv from "dotenv";
dotenv.config();

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
});
export const mistral_model: LanguageModel = mistral(
  "open-mistral-7b"
);
