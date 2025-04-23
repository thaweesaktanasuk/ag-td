import { fetchDocsContent, llmTalk, llmLogic, livekitCreateRoom, livekitDeleteRoom, livekitSendData, livekitToken, livekitDispatch, livekitCall, livekitOutboundTrunk, livekitRecording, sendAgentEvent } from "./functions";
import { client } from "./client";

async function services() {
  const agentsPath = require.resolve("./agents");
  const workflowsPath = require.resolve("./workflows");
  try {
    await Promise.all([
      client.startService({
        agentsPath: agentsPath,
        functions: {
          livekitCall,
          livekitCreateRoom,
          livekitDeleteRoom,
          livekitDispatch,
          livekitOutboundTrunk,
          livekitRecording,
          livekitSendData,
          livekitToken,
          llmTalk,
          fetchDocsContent,
          llmLogic,
          sendAgentEvent,
        },
      }),
      client.startService({
        workflowsPath: workflowsPath,
        taskQueue: "logic-workflow",
      }),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run services", e);
  }
}

services().catch((err) => {
  console.error("Error running services:", err);
});
