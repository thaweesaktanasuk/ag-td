import {
  workflowSendEvent,
  erpGetTools,
  erpPlaceOrder,
  erpCheckInventory,
  erpCheckPrice,
  websocketSend,
  websocketListen,
  twilioCall,
  openaiChatCompletionsBase,
  openaiChatCompletionsStream,
  deepgramListen,
  deepgramSpeak,
} from "./functions";
import { client } from "./client";

export async function services() {
  const workflowsPath = require.resolve("./workflows");

  try {
    await Promise.all([
      client.startService({
        workflowsPath,
        functions: { workflowSendEvent },
      }),
      client.startService({
        taskQueue: "erp",
        functions: {
          erpGetTools,
          erpCheckPrice,
          erpCheckInventory,
          erpPlaceOrder,
        },
      }),
      client.startService({
        taskQueue: "websocket",
        functions: {
          websocketSend,
          websocketListen,
        },
      }),
      client.startService({
        taskQueue: "twilio",
        functions: {
          twilioCall,
        },
      }),
      client.startService({
        taskQueue: "openai",
        functions: {
          openaiChatCompletionsBase,
          openaiChatCompletionsStream,
        },
      }),
      client.startService({
        taskQueue: "deepgram",
        functions: {
          deepgramListen,
          deepgramSpeak,
        },
      }),

    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run worker", e);
  }
}

services().catch((err) => {
  console.error("Error in services:", err);
});
