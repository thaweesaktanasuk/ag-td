import {step, workflowInfo } from "@restackio/ai/workflow";
import * as functions from "../functions";


export type EndFlowInput = {
  eventData: {
    response: "success" | "failure";
  }
};

export type EndFlowOutput = {
  response: "success" | "failure";
  rawResponse: any;
};

export async function endFlow(input: EndFlowInput): Promise<EndFlowOutput> {


  const agentId = workflowInfo().parent?.workflowId;
  const runId = workflowInfo().parent?.runId;

  if (!agentId || !runId) {
    throw new Error("Workflow ID or run ID is not available");
  }

  await step<typeof functions>({}).sendAgentEvent({
    eventName: 'end',
    eventInput: {},
    agentId,
    runId,
  });

  if (input.eventData.response === "success") {
    return {
      response: "success",
      rawResponse: {},
    };
  } else {
    return {
      response: "failure",
      rawResponse: {},
    };
  }

}