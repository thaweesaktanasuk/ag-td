import { ReactFlowJsonObject } from "reactflow";

export function parseReactFlowJson(reactflowJson: ReactFlowJsonObject) {
  return {
    nodes: reactflowJson.nodes || [],
    edges: reactflowJson.edges || [],
  };
}

export type DSLInterpreterInput = {
  reactflowJson: ReactFlowJsonObject;
};

export type DSLInterpreterOutput = {
  flowMap: {
    eventName: string;
    workflowType: string;
    flowPrompt: string;
    flowOutputConditions: string[];
    edgeConditions: {
      targetNodeId: string;
      condition: string;
    }[];
  }[];
};

export async function dslInterpreter({reactflowJson}: DSLInterpreterInput): Promise<DSLInterpreterOutput> {
  const { nodes, edges } = parseReactFlowJson(reactflowJson);

  const flowMap = nodes.map((node: any) => {
    const outgoingEdges = edges.filter((edge: any) => edge.source === node.id);
    const edgeConditions = outgoingEdges.map((edge: any) => ({
      targetNodeId: edge.target,
      condition: edge.sourceHandle ?? edge.source,
    }));

    return {
      eventName: node.id,
      workflowType: node.id,
      flowPrompt: node.data.flowPrompt,
      flowOutputConditions: node.data.flowOutputConditions,
      edgeConditions,
    };
  });

  return { flowMap };
}