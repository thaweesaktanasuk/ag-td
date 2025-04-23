import { llmResponse, idVerification, humanVerification, dslInterpreter, mockFlow, sendAgentEvent, llmChat } from "./functions";
import { client } from "./client";

async function services() {
  const agentsPath = require.resolve("./agents");
  const workflowsPath = require.resolve("./workflows");
  try {
    await Promise.all([
      client.startService({
        agentsPath: agentsPath,
        functions: { dslInterpreter, mockFlow, sendAgentEvent, llmChat },
      }),
      client.startService({
        workflowsPath: workflowsPath,
        functions: { llmResponse, idVerification, humanVerification },
        taskQueue: "workflow"
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
