"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"
import { getWorkflowResult, runWorkflow } from "../app/actions/workflow"
import { ReactFlowInstance, Node } from "@xyflow/react"

interface WorkflowEditPanelProps {
  onClose: () => void
  reactFlowInstance: ReactFlowInstance
  setNodes: (nodes: any) => void
  setEdges: (edges: any) => void
}

export default function WorkflowEditPanel({ onClose, reactFlowInstance, setNodes, setEdges }: WorkflowEditPanelProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [runId, setRunId] = useState<string | null>(null)
  const [inputData, setInputData] = useState(
    JSON.stringify(
      { type: "id", documentNumber: "1234567890" },
      null,
      2,
    ),
  )
  const [outputConditions, setOutputConditions] = useState(["success", "successUnder35", 'failure'])
  const [prompt, setPrompt] = useState("Please verify the user's identity. if status approved return success, if apprvoed andperson under 35 return successUnder35, if declined return failure")
  const [result, setResult] = useState<any>(null)
  const executeWorkflow = async () => {
    setIsRunning(true)

    const workflowName = "idVerification"

    try {
      const { workflowId, runId } = await runWorkflow({
        workflowName,
        input: {
          eventData: JSON.parse(inputData),
          flow: {
            prompt,
            outputConditions,
          }
        }
      })

      setWorkflowId(workflowId)
      setRunId(runId)

      // Update nodes to show loading status
      setNodes((prevNodes: Node[]) =>
        prevNodes.map((node) =>
          node.id === workflowName
            ? { ...node, data: { ...node.data, status: 'loading' } }
            : node
        )
      );

      const result = await getWorkflowResult({
        workflowId,
        runId
      })

      setNodes((prevNodes: Node[]) =>
        prevNodes.map((node) =>
          node.id === workflowName
            ? { ...node, data: { ...node.data, status: 'success' } }
            : node
        )
      );

      setResult(result)

    } catch (error) {
      console.error("An error occurred while executing the workflow", error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div className="absolute right-0 top-0 flex h-full w-96 flex-col border-l bg-background shadow-lg">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Edit Workflow</h2>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Input Data</label>
            <textarea
              rows={5}
              className="w-full rounded-md border bg-background p-2 font-mono text-sm"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">AI prompt </label>
            <textarea
              rows={5}
              className="w-full rounded-md border bg-background p-2 font-mono text-sm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Output conditions</label>
            <textarea
              rows={5}
              className="w-full rounded-md border bg-background p-2 font-mono text-sm"
              value={outputConditions.join(", ")}
              onChange={(e) => setOutputConditions(e.target.value.split(", "))}
            />
          </div>

          <Button variant="default" onClick={executeWorkflow} disabled={isRunning} className="w-full bg-foreground text-background">
            {isRunning ? "Executing..." : "Execute Workflow"}
          </Button>
        </div>
        {result && (
          <div>
            <h3>Result</h3>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
} 