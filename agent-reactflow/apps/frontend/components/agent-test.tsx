"use client"

import { useState } from "react"
import { X, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "./ui/button"
import { runAgent, sendAgentEvent, getAgentResult } from "../app/actions/agent"
import { ReactFlowInstance, Node } from "@xyflow/react"
import Link from "next/link"

interface AgentTestPanelProps {
  onClose: () => void
  workflowData: any
  isTestMode: boolean
  reactFlowInstance: ReactFlowInstance
  setNodes: (nodes: any) => void
  setEdges: (edges: any) => void
}

interface TestResult {
  status: "running" | "completed" | "error"
  workflows: {
    id: string
    status: "running" | "completed" | 'error'
    rawResponse?: any
    response?: any
  }[]
  results?: any
  error?: string
}

export default function AgentTestPanel({ onClose, workflowData, reactFlowInstance, setNodes, setEdges }: AgentTestPanelProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [runId, setRunId] = useState<string | null>(null)
  const [inputData, setInputData] = useState(
    JSON.stringify(
      { type: "id", documentNumber: "1234567890" },
      null,
      2,
    ),
  )

  console.log('testResult', testResult)

  const startAgent = async () => {
    setAgentId(null)
    setRunId(null)
    setIsRunning(true)

    try {
      const { agentId, runId } = await runAgent({
        agentName: "agentFlow",
        // input: { flowJson: workflowData },
        input: {}
      })

      setNodes((prevNodes: Node[]) =>
        prevNodes.map((node) =>
          node.id === 'start'
            ? { ...node, data: { ...node.data, status: 'loading' } }
            : node
        )
      );

      setAgentId(agentId)
      setRunId(runId)

    } catch (error) {
      setTestResult({
        status: "error",
        workflows: [],
        error: "An error occurred while starting the agent",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const sendEvent = async () => {
    
    if (!runId || !agentId) return

    
    setIsSending(true)
    setTestResult(null)

    const workflowId = "idVerification"

    try {
      // Send a test event

      setNodes((prevNodes: Node[]) =>
        prevNodes.map((node) =>
          node.id === workflowId
            ? { ...node, data: { ...node.data, status: 'loading' } }
            : { ...node, data: { ...node.data, status: 'initial' } }
        )
      );

      console.log("sending event", workflowId, inputData)

      if (!agentId || !runId || !workflowId || !inputData) {
        throw new Error("Agent ID, run ID, workflow ID, and input data are required")
      }

      const eventResult = await sendAgentEvent({
        agentId,
        runId,
        workflowName: workflowId,
        eventInput: JSON.parse(inputData),
      })

      console.log("eventResult", eventResult)

      setNodes((prevNodes: Node[]) =>
        prevNodes.map((node) =>
          node.id === workflowId
            ? { ...node, data: { ...node.data, status: 'success' } }
            : node.id === eventResult.nextEvent
            ? { ...node, data: { ...node.data, status: 'loading' } }
            : node
        )
      );

      setTestResult({
        status: "running",
        workflows: [{
          id: workflowId,
          status: "completed",
          rawResponse: eventResult.rawResponse,
          response: eventResult.response,
        }],
      })

      // poll the agent until it is completed
      while (true) {
        const result = await getAgentResult({agentId, runId})
        console.log("result", result)
        if (result.results) {
          setTestResult({
            status: "completed",
            workflows: [result.results],
            results: result.results,
          })
          setNodes((prevNodes: Node[]) =>
            prevNodes.map((node) => {
              const lastResultNode = result.results[result.results.length - 1];
              return node.id === lastResultNode.id ? { ...node, data: { ...node.data, status: 'success' } } : node;
            })
          );
          break
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      

    } catch (error) {

      setNodes((prevNodes: Node[]) =>
        prevNodes.map((node) =>
          node.id === workflowId
            ? { ...node, data: { ...node.data, status: 'error' } }
            : node
        )
      );

      setTestResult({
        status: "error",
        workflows: [
          {
            id: workflowId,
            status: "error",
          }
        ],
        error: "An error occurred during the event",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="absolute right-0 top-0 flex h-full w-96 flex-col border-l bg-background shadow-lg">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Test agent</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 p-4">
        <div className="space-y-4">
          

          <Button variant="default" onClick={startAgent} disabled={isRunning || runId !== null} className="w-full bg-foreground text-background">
            {isRunning ? "Running..." : "Run agent"}
          </Button>

          {runId && <div className="p-4 text-xs bg-muted-foreground/10 rounded-md overflow-hidden space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase text-muted-foreground">Dev debug info</p>
              <Link href={`http://localhost:5233/runs/${agentId}/${runId}?scheduledEventId=1`} target="_blank" className="text-xs underline text-muted-foreground hover:text-foreground">Open on Restack</Link>
            </div>
            <pre>{JSON.stringify({agentId, runId}, null, 2)}</pre>
          </div>}

          <div>
            <label className="mb-2 block text-sm font-medium">Event input</label>
            <textarea
              rows={5}
              className="w-full rounded-md border bg-background p-2 font-mono text-sm"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
            />
          </div>

          <Button variant="default" onClick={sendEvent} disabled={runId === null} className="w-full bg-foreground text-background">
            {isSending ? "Sending..." : "Send event"}
          </Button>
        </div>

        {testResult && (
          <div className="mt-4 space-y-4">
            <h3 className="font-medium">Execution Status</h3>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResult.status)}
              <span className="capitalize">{testResult.status}</span>
            </div>
            {testResult.workflows && (
              testResult.workflows.map((workflow) => (
                <div key={workflow.id} className="space-y-4">
                  <p>{workflow.id}</p>
                  <p>Response</p>
                  <div className="mt-2 rounded-md border bg-background p-3">
                    <pre className="text-sm">{JSON.stringify(workflow.response, null, 2)}</pre>
                  </div>
                  <p>Raw Response</p>
                  <div className="mt-2 rounded-md border bg-background p-3">
                    <pre className="text-sm">{JSON.stringify(workflow.rawResponse, null, 2)}</pre>
                  </div>
                </div>
              ))
            )}
            {testResult.results && (
              <div className="mt-2 rounded-md border bg-background p-3">
                <pre className="text-sm">{JSON.stringify(testResult.results, null, 2)}</pre>
              </div>
            )}
            {testResult.error && (
              <div className="mt-2 text-sm text-red-500">{testResult.error}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

