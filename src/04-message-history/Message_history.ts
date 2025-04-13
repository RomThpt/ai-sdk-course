import type { CoreMessage } from "ai";
import { startServer } from "../../server/server";

const messageHistory: CoreMessage[] = [
  {
    role: "system",
    content: "Vous êtes un accueillant sympathique.",
  },
  {
    role: "user",
    content: "Bonjour, toi !",
  },
  {
    role: "assistant",
    content: "Salut !",
  },
];

await startServer();

const response = await fetch(
  "http://localhost:4317/api/chat",
  {
    method: "POST",
    body: JSON.stringify({
      messages: messageHistory,
    }),
  }
);

const newMessages =
  (await response.json()) as CoreMessage[];

export const allMessagesWithUserMessage = [
  ...messageHistory,
  ...newMessages,
];

