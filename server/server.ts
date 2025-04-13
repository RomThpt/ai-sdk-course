import { mistral_model } from "../models/mistral_model";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { once } from "node:events";
import { CoreMessage, generateText } from "ai";

const model = mistral_model;

export const startServer = async () => {
  const app = new Hono();

  app.post("/api/get-completions", async (ctx) => {
    const messages: CoreMessage[] =
      await ctx.req.json();

    const result = await generateText({
      model,
      messages,
    });
    result.response.messages;
  });
  const server = serve({
    fetch: app.fetch,
    port: 4317,
    hostname: "0.0.0.0",
  });
  // Wait for the server to start listening
  await once(server, "listening");
};
