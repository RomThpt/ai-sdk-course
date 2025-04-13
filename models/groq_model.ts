import { createGroq } from "@ai-sdk/groq";

import dotenv from "dotenv";
dotenv.config();

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});
export const groq_model = groq(
  "llama-3.3-70b-versatile"
);
