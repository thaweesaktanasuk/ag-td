import { client } from "./src/client";

import { endEvent, feedbackEvent } from "./src/events";

async function scheduleAgent() {
  try {
    const agentId = `${Date.now()}-HumanLoopAgent`;
    const runId = await client.scheduleAgent({
      agentName: "humanLoopAgent",
      agentId,
    });

    const feedback = await client.sendAgentEvent({
      agent: {
        agentId,
        runId,
      },
      event: {
        name: feedbackEvent.name,
        input: { feedback: "Hello, how are you?" },
      },
    });

    console.log("Feedback:", feedback);

    const end = await client.sendAgentEvent({
      agent: {
        agentId,
        runId,
      },
      event: { name: endEvent.name, input: { end: true } },
    });

    console.log("End:", end);

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error scheduling agent:", error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleAgent();
