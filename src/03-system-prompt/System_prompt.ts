import { generateText } from "ai";
import { mistral_model } from "../../models/mistral_model";

export const generateTextResponseWithSystemPrompt =
  async (prompt: string) => {
    const { text } = await generateText({
      model: mistral_model,
      messages: [
        {
          role: "system",
          content:
            `You are a text summarizer. ` +
            `Summarize the text you receive. ` +
            `Be concise. ` +
            `Return only the summary. ` +
            `Do not use the phrase "here is a summary". ` +
            `Highlight relevant phrases in bold. ` +
            `The summary should be two sentences long. `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    return text;
  };
