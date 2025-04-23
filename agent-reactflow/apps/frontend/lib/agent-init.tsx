import type { Edge } from "@xyflow/react"
import { workflowData } from "./workflowData"

export const nodes = workflowData

export const edges: Edge[] = [
  {
    id: `edge-start-idVerification`,
    source: "start",
    target: "idVerification",
  },
  {
    id: `edge-idVerification-manualVerification`,
    source: "idVerification",
    target: "manualVerification",
    sourceHandle: "successUnder35",
    type: "workflow",
  },
  {
    id: `edge-idVerification-endFlow`,
    source: "idVerification",
    target: "endFlow",
    sourceHandle: "success",
    type: "workflow",
  },
  {
    id: `edge-manualVerification-endFlow`,
    source: "manualVerification",
    target: "endFlow",
    type: "workflow",
  },
] 