"use server";
import Restack from "@restackio/ai";

const connectionOptions = {
  engineId: process.env.RESTACK_ENGINE_ID!,
  address: process.env.RESTACK_ENGINE_ADDRESS!,
  apiKey: process.env.RESTACK_ENGINE_API_KEY!,
};

const client = new Restack(
  process.env.RESTACK_ENGINE_API_KEY ? connectionOptions : undefined
);

export async function runAgent({
  agentName = "agentFlow",
  input = {},
}: {
  agentName: string,
  input: any,
}) : Promise<any> {
  if (!agentName || !input) {
    throw new Error("Agent name and input are required");
  }

  const agentId = `${Date.now()}-${agentName.toString()}`;

  const runId = await client.scheduleAgent({
    agentName,
    agentId,
    input,
  });

  return {
    agentId,
    runId
  }
}

export async function getAgentResult({
  agentId,
  runId
}: {
  agentId: string,
  runId: string
}) : Promise<any> {
  const result = await client.getAgentResult({
    agentId,
    runId
  });
  return result
}

export async function sendAgentEvent({
  agentId,
  runId,
  workflowName,
  eventInput
}: {
  agentId: string,
  runId: string,
  workflowName: string,
  eventInput: any
}) : Promise<any> {

  console.log("sendAgentEvent", agentId, runId, workflowName, eventInput)

  if (!agentId || !runId || !workflowName || !eventInput) {
    throw new Error("Agent ID, run ID, workflow name, and event input are required");
  }
  
  try { 
    const eventPayload = {
      event: {
        name: "flowEvent",
        input: {
          name: workflowName,
          input: eventInput
        }
      },
      agent: {
        agentId,
        runId
      }
    }

    console.log("eventPayload", eventPayload)
    const result = await client.sendAgentEvent(eventPayload);
    return result
  } catch (error) {
    console.error("Error sending agent event", error)
    throw error
  }
}