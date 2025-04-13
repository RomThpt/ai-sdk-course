import dotenv from "dotenv";
import { generateTextResponse } from "./src/01-generate-text/Generate_Text";
import { streamTextResponse } from "./src/02-streaming-text/Streaming_Text";
import { generateTextResponseWithSystemPrompt } from "./src/03-system-prompt/System_prompt";
import { groq_model } from "./models/groq_model";
import { startServer } from "./server/server";
import { allMessagesWithUserMessage } from "./src/04-message-history/Message_history";
import { CoreMessage } from "ai";
import { createRecipe } from "./src/05-structured-outputs/Structured_output";
import { logToConsole } from "./src/07-tool-calling/Tool_Calling";
import { askWeather } from "./src/08-weather-app/Weather";

dotenv.config();

// const response = await generateTextResponse(
//   "Quelle est la formule chimique du monoxyde de dihydrogène ?"
// );

// const response = await streamTextResponse(
//   "Quelle est la formule chimique du monoxyde de dihydrogène ?"
// );

// const response = await generateTextResponseWithSystemPrompt(
//   "Quelle est la formule chimique du monoxyde de dihydrogène ?"
// );

// const response = await allMessagesWithUserMessage;
// console.dir(response, { depth: null });

// const response = await createRecipe(
//   "Comment faire du baba ganoush ?"
// );

// const response = await createRecipeStreamed(
//   "Comment faire du baba ganoush ?"
// );

// const response = await logToConsole("Hello, world!");

const response = await askWeather(
  "Quel temps fait-il à Londres ?"
);

console.log(response);
