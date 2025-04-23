import { client } from "./src/client";

export type EventInput = {
  agentId: string;
  runId: string;
};

async function eventAgent(input: EventInput) {
  try {
    await client.sendAgentEvent({
      event: {
        name: "flowEvent",
        input: { name: "idVerification", input: { type: "id", documentNumber: "1234567890" } },
      },
      agent: {
        agentId: input.agentId,
        runId: input.runId,
      },
    });

    // await client.sendAgentEvent({
    //   event: {
    //     name: "end",
    //   },
    //   agent: {
    //     agentId: input.agentId,
    //     runId: input.runId,
    //   },
    // });

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error("Error sending event to agent:", error);
    process.exit(1); // Exit the process with an error code
  }
}

eventAgent({"agentId":"1743008631706-agentFlow","runId":"0195d369-0b9d-7ded-ab82-20e275e295da"});
