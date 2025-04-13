import { streamText } from "ai";
import { mistral_model } from "../../models/mistral_model";

export const streamTextResponse = async (
  prompt: string
) => {
  const { textStream } = await streamText({
    model: mistral_model,
    prompt,
  });
  return textStream;
};
