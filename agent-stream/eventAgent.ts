import { client } from "./src/client";

export type EventInput = {
  agentId: string;
  runId: string;
};

async function eventAgent(input: EventInput) {
  try {
    await client.sendAgentEvent({
      event: {
        name: "call",
        input: { phoneNumber: "+XXXXXXX" },
      },
      agent: {
        agentId: input.agentId,
        runId: input.runId,
      },
    });

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error sending event to agent:", error);
    process.exit(1); // Exit the process with an error code
  }
}

eventAgent({
  agentId: "agent-id",
  runId: "run-id",
});
