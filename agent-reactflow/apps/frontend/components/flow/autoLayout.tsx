"use client"

import ELK from "elkjs/lib/elk.bundled.js"
import type { Node, Edge } from "@xyflow/react"

// Initialize ELK
const elk = new ELK()

// ELK layout options
const elkOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "DOWN",
  "elk.layered.spacing.nodeNodeBetweenLayers": "50",
  "elk.layered.spacing.edgeNodeBetweenLayers": "50",
  "elk.layered.spacing.edgeEdgeBetweenLayers": "50",
  "elk.layered.spacing.nodeEdgeBetweenLayers": "50",
  // "elk.edgeRouting": "STRAIGHT",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  // "elk.layered.considerModelOrder": "true",
  // "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  // "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
  // "elk.layered.nodePlacement.favorStraightEdges": "true",
  // "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
  //  "elk.separateConnectedComponents": "false",
  //  "elk.alignment": "CENTER",
  // // // Additional options for better vertical alignment
  // "elk.layered.unnecessaryBendpoints": "true",
  // "elk.layered.mergeEdges": "true",
  // "elk.layered.mergeHierarchyEdges": "true",
  // "elk.hierarchyHandling": "INCLUDE_CHILDREN",
  // "elk.cycleBreaking.strategy": "DEPTH_FIRST",
  // "elk.aspectRatio": "0.5", // Favor vertical layout
  // "elk.padding": "[top=50,left=50,bottom=50,right=50]",
}

// Convert React Flow nodes and edges to ELK format
const toElkGraph = (nodes: Node[], edges: Edge[]) => {
  return {
    id: "root",
    layoutOptions: elkOptions,
    children: nodes.map((node) => ({
      id: node.id,
      width: 155,
      height: 50,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
      sections: [],
    })),
  }
}

// Apply ELK layout to React Flow nodes
export const getLayoutedElements = async (nodes: Node[], edges: Edge[]) => {
  if (!nodes.length) return { nodes, edges }

  const elkGraph = toElkGraph(nodes, edges)
  const layoutedGraph = await elk.layout(elkGraph)

  // Apply the layout to the nodes
  const layoutedNodes = nodes.map((node) => {
    const elkNode = layoutedGraph.children?.find((n) => n.id === node.id)
    if (elkNode && elkNode.x !== undefined && elkNode.y !== undefined) {
      return {
        ...node,
        position: {
          x: elkNode.x,
          y: elkNode.y,
        },
      }
    }
    return node
  })

  return { nodes: layoutedNodes, edges }
}

// Create nodes without positions (ELK will calculate them)
export const createNode = (type: string, data: any) => {
  return {
    id: `${type}-${Date.now()}`,
    type,
    // Position will be calculated by ELK
    position: { x: 0, y: 0 },
    data,
  }
}

