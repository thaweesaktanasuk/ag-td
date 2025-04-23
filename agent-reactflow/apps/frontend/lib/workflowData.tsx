import type { Node } from "@xyflow/react";
import { Position } from "@xyflow/react";

export const workflowData: Node[] = [
  {
    id: "start",
    type: "default",
    position: { x: 0, y: 0 },
    data: {
      label: "Start",
      description: "Start the agent",
      icon: 'PlayCircle',
      handles: [
        { id: 'next', type: 'source', position: Position.Bottom },
      ],
      status: 'initial',
    },
  },
  {
    id: "endFlow",
    type: "workflow",
    position: { x: 0, y: 0 },
    data: {
      label: "End",
      description: "End of the agent",
      icon: 'StopCircle',
      handles: [
        { id: 'input', type: 'target', position: Position.Top },
      ],
      status: 'initial',
    },
  },
  {
    id: "idVerification",
    type: "workflow",
    position: { x: 0, y: 0 },
    data: {
      label: "Id verification",
      description: "Automated verification",
      icon: 'Cpu',
      handles: [
        { id: 'input', type: 'target', position: Position.Top },
        { id: 'success', type: 'source', position: Position.Bottom },
        { id: 'successUnder35', type: 'source', position: Position.Bottom },
      ],
      status: 'initial',
    },
  },
  {
    id: "manualVerification",
    type: "workflow",
    position: { x: 0, y: 0 },
    data: {
      label: "Manual verification",
      description: "Human in the loop",
      icon: 'User',
      handles: [
        { id: 'input', type: 'target', position: Position.Top },
        { id: 'success', type: 'source', position: Position.Bottom },
        { id: 'failure', type: 'source', position: Position.Bottom },
        
      ],
      status: 'initial',
    },
  },
];