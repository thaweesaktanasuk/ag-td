"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { ReactFlow,
  ReactFlowProvider,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Button } from "./ui/button"
import { Sparkles, Workflow } from "lucide-react"
import WorkflowSelector from "./workflow-selector"
import AgentChat from "./agent-chat"
import AgentHeader from "./agent-header"
import { nodeTypes, NodeData } from "./flow/workflowNode"
import { edgeTypes } from "./flow/baseEdge"
import { nodes as initialNodes, edges as initialEdges } from "../lib/agent-init"
import AgentTestPanel from "./agent-test"
import { createNode, getLayoutedElements } from "./flow/autoLayout"
import WorkflowEditPanel from "./workflow-edit"
import { validateNodeIds, getWorkflowTypes } from "@restackio/react/hook"

export default function WorkflowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [showWorkflowSelector, setShowWorkflowSelector] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [showTestPanel, setShowTestPanel] = useState(false)
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [agentName, setAgentName] = useState("Verification agent")
  const [agentVersion, setAgentVersion] = useState("v1.2")
  const [isLayouting, setIsLayouting] = useState(false)
  const [viewMode, setViewMode] = useState<'flow' | 'json'>('flow')
  const [workflowTypes, setWorkflowTypes] = useState<Record<string, string>>({})

  // Apply layout when nodes or edges change
  const applyLayout = useCallback(async () => {
    if (isLayouting || !nodes.length) return

    setIsLayouting(true)
    const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(nodes, edges)

    setNodes([...layoutedNodes])
    setEdges([...layoutedEdges])
    setIsLayouting(false)

    // Center the view after layout
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 })
      }, 50)
    }
  }, [nodes, edges, isLayouting, setNodes, setEdges, reactFlowInstance])

  // Initialize with initial nodes and edges
  useEffect(() => {
    const initializeFlow = async () => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(initialNodes, initialEdges)
      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
    }

    initializeFlow()
  }, [setNodes, setEdges])

  // Apply layout when nodes or edges change significantly
  useEffect(() => {
    const timer = setTimeout(() => {
      applyLayout()
    }, 200)

    return () => clearTimeout(timer)
  }, [nodes.length, edges.length, applyLayout])

  useEffect(() => {
    const fetchAndValidateWorkflowTypes = async () => {
      try {
        const types = await getWorkflowTypes()
        setWorkflowTypes(types)
        const validationError = validateNodeIds(nodes, types)
        if (validationError) {
          console.error(validationError)
        }
      } catch (error) {
        console.error("Error fetching or validating workflow types:", error)
      }
    }

    // Only fetch and validate if nodes have changed
    if (nodes.length > 0) {
      fetchAndValidateWorkflowTypes()
    }
  }, [nodes])

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")

      if (typeof type === "undefined" || !type || !reactFlowInstance) {
        return
      }

      const nodeData = JSON.parse(event.dataTransfer.getData("application/nodeData")) as NodeData;

      console.log("nodeData", nodeData)

      // Create node without position (ELK will calculate it)
      const newNode = createNode(type, {
        ...nodeData,
      })

      console.log("newNode", newNode)
      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes],
  )

  const toggleWorkflowSelector = () => {
    setShowWorkflowSelector(!showWorkflowSelector)
  }

  const toggleChat = () => {
    setShowChat(!showChat)
  }

  const openTestPanel = () => {
    setShowTestPanel(true);
    setShowChat(false);
    setShowWorkflowSelector(false);
  };

  const setTestStatus = (workflowId: string, status: 'initial' | 'loading' | 'success' | 'error') => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === workflowId
          ? { ...node, data: { ...node.data, status } }
          : node
      )
    );
  };

  const closeTestPanel = () => {
    setShowTestPanel(false);
    setShowChat(true);
  };

  const openEditPanel = () => {
    setShowEditPanel(true);
    setShowChat(false);
    setShowWorkflowSelector(false);
  };

  const closeEditPanel = () => {
    setShowEditPanel(false);
    setShowChat(true);
  };

  const deleteNode = (nodeId: string) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
  };

  const exportToJson = () => {
    const flowData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        data: node.data,
        position: node.position,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
      })),
    };
    return JSON.stringify(flowData, null, 2);
  };

  const toggleViewMode = () => {
    setViewMode(prevMode => (prevMode === 'flow' ? 'json' : 'flow'));
  };

  const clearAllNodesAndEdges = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <div className="flex h-screen flex-col">
      <AgentHeader agentName={agentName} agentVersion={agentVersion} onOpenTestPanel={() => openTestPanel()} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-14 flex-col items-center border-r bg-background py-4">
          <div className="flex flex-col items-center gap-4">
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={toggleChat}>
              {showChat ? <Sparkles className="h-5 w-5 opacity-50" /> : <Sparkles className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={toggleWorkflowSelector}>
              {showWorkflowSelector ? <Workflow className="h-5 w-5 opacity-50" /> : <Workflow className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {viewMode === 'flow' ? (
          <div className="relative flex-1">
            <div className="h-full w-full" ref={reactFlowWrapper}>
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes.map(node => ({
                    ...node,
                    data: {
                      ...node.data,
                      openEditPanel,
                      deleteNode,
                    },
                  }))}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  nodeTypes={nodeTypes as unknown as NodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  defaultEdgeOptions={{ type: 'step', selectable: false, focusable: false }}
                >
                  <Background gap={20} />
                </ReactFlow>
                {showChat && reactFlowInstance &&(
                    <AgentChat
                      onClose={toggleChat}
                      reactFlowInstance={reactFlowInstance}
                      setNodes={setNodes}
                      setEdges={setEdges}
                    />
                )}
                {showTestPanel && (
                  <AgentTestPanel
                    onClose={closeTestPanel}
                    workflowData={{ nodes, edges }}
                    isTestMode={showTestPanel}
                    reactFlowInstance={reactFlowInstance}
                    setNodes={setNodes}
                    setEdges={setEdges}
                  />
                )}
                {showEditPanel && (
                  <WorkflowEditPanel
                    onClose={closeEditPanel}
                    reactFlowInstance={reactFlowInstance}
                    setNodes={setNodes}
                    setEdges={setEdges}
                  />
                )}
              </ReactFlowProvider>
            </div>

            {showWorkflowSelector && <WorkflowSelector onClose={toggleWorkflowSelector} />}

           

            
          </div>
        ) : (
          <div className="relative flex-1">
            
            <div className="h-full w-full overflow-auto p-4 space-y-4">
              <Button
              variant="default"
              onClick={() => navigator.clipboard.writeText(exportToJson())}
              className="bg-foreground text-background"
              >
                Copy JSON to Clipboard
              </Button>
              <pre className="text-xs p-4 bg-neutral-100 dark:bg-neutral-900 rounded-md">{exportToJson()}</pre>
            </div>
            
          </div>
        )}


        <div className="absolute bottom-0 right-0">
          <div className="flex justify-end p-4">
            <Button variant="ghost" onClick={clearAllNodesAndEdges}>
              Clear All
            </Button>
            <Button variant="ghost" onClick={toggleViewMode}>
              {viewMode === 'flow' ? 'Show JSON' : 'Show Flow'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

