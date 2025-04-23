import {step } from "@restackio/ai/agent";
import * as functions from "../functions";

export type manualVerificationInput = {
  eventData: {
    context: string;
  },
  flow: {
    prompt?: string;
    outputConditions: string[];
  }
};


export type manualVerificationOutput = {
  response: string[];
  rawResponse: any;
}

export async function manualVerification(input: manualVerificationInput): Promise<manualVerificationOutput> {
    console.log("Manual Verification Workflow Executed");

    const verificationResult = await step<typeof functions>({taskQueue: "workflow"}).humanVerification({
      context: input.eventData.context,
    });

    const llmResponse = await step<typeof functions>({taskQueue: "workflow"}).llmResponse({
      messages: [
        {
          role: "user",
          content: `${input.flow.prompt} : ${JSON.stringify(verificationResult)}`,
        },
      ],
      workflowName: "manualVerification",
      outputConditions: input.flow.outputConditions,
    });

    return {
      response: llmResponse,
      rawResponse: verificationResult,
    };

}