import {step } from "@restackio/ai/workflow";
import * as functions from "../functions";

export type DocCaptureWorkflowInput = {
  eventData: {
    type: "id" | "passport" | "driverLicense";
    documentNumber: string;
  },
  flow: {
    prompt: string;
    outputConditions: string[];
  }
};

export type IdVerificationWorkflowOutput = {
  response: string[];
  rawResponse: any;
}

export async function idVerification(input: DocCaptureWorkflowInput): Promise<IdVerificationWorkflowOutput> {

    const verificationResult = await step<typeof functions>({taskQueue: "workflow",}).idVerification({
      type: input.eventData.type,
      documentNumber: input.eventData.documentNumber,
    });

    const llmResponse = await step<typeof functions>({taskQueue: "workflow",}).llmResponse({
      messages: [
        {
          role: "user",
          content: `${input.flow.prompt} : ${JSON.stringify(verificationResult)}`,
        },
      ],
      workflowName: "idVerification",
      outputConditions: input.flow.outputConditions,
    });

    return {
      response: llmResponse,
      rawResponse: verificationResult,
    }
}