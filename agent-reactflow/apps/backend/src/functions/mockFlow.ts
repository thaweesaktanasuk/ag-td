import { FunctionFailure } from "@restackio/ai/function";
import { ReactFlowJsonObject } from "reactflow";
import { endFlow, idVerification, manualVerification } from "../workflows";

export const mockFlow = async (): Promise<ReactFlowJsonObject> => {
  try {

    return {
      nodes: [
        {
          id: idVerification.name,
          type: "workflow",
          data: {
            eventType: idVerification.name,
            workflowType: idVerification.name,
            flowPrompt: 'Given the following input, determine if id verification is successful and the user is above 35 years old or not: ',
            flowOutputConditions: ["success", "successUnder35", 'failure'],
            status: "initial",
          },
         
          position: { x: 0, y: 0 } },
        {
          id: manualVerification.name,
          type: "workflow",
          data: {
            eventType: manualVerification.name,
            workflowType: manualVerification.name,
            flowPrompt: 'Given the following input, determine if verification is successful or not: ',
            flowOutputConditions: ["success", "failure"],
          },
          position: { x: 100, y: 100 } },
        {
          id: endFlow.name,
          type: "default",
          data: {
            eventType: endFlow.name,
            workflowType: endFlow.name,
          },
          position: { x: 200, y: 200 }
        }
      ],
      edges: [
        { id: `edge-${idVerification.name}-${manualVerification.name}-success`,
        source: idVerification.name,
        target: endFlow.name,
        sourceHandle: "success",
       },
       { id: `edge-${idVerification.name}-${manualVerification.name}-successAbove35`,
        source: idVerification.name,
        target: manualVerification.name,
        sourceHandle: "successUnder35",
       },
       {
        id: `edge-${idVerification.name}-${manualVerification.name}-failure`,
        source: idVerification.name,
        target: endFlow.name,
        sourceHandle: "failure",
       },
       { id: `edge-${manualVerification.name}-${endFlow.name}-success`,
        source: manualVerification.name,
        target: endFlow.name,
        sourceHandle: "success",
       },
       { id: `edge-${manualVerification.name}-${endFlow.name}-failure`,
        source: manualVerification.name,
        target: endFlow.name,
        sourceHandle: "failure",
       }
      ],
      viewport: { x: 0, y: 0, zoom: 1 }
    };;
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error mockFlow: ${error}`);
  }
};
