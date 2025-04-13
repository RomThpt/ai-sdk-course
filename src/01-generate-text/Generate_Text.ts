import { generateText } from "ai";
import { mistral_model } from "../../models/mistral_model";

export const generateTextResponse = async (
  prompt: string
) => {
  const { text } = await generateText({
    model: mistral_model,
    prompt,
  });
  return text;
};
