"use client"

import React from "react"

import { useState } from "react"
import { X, Search, Workflow, StepForward } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"
import { workflowData } from "../lib/workflowData"
import * as Icons from "lucide-react";
 
interface WorkflowSelectorProps {
  onClose: () => void
}

interface NodeData {
  label: string;
  description: string;
  icon: string;
  badge?: string;
}

function isNodeData(data: any): data is NodeData {
  return (
    typeof data.label === 'string' &&
    typeof data.description === 'string' &&
    typeof data.icon === 'string'
  );
}

export default function WorkflowSelector({ onClose }: WorkflowSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNodes = searchQuery
    ? workflowData.filter((node) =>
        isNodeData(node.data) &&
        (node.data.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
         node.data.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : workflowData

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.setData("application/nodeData", JSON.stringify(nodeData))
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="absolute right-0 top-0 h-full w-96 border-l bg-background p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4" />
          <h2 className="text-lg font-semibold">Add a workflow</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search workflows..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
        <div className="space-y-4 pr-4">
          {filteredNodes.map((node) => (
            node.type && isNodeData(node.data) && (
              <div
                key={node.id}
                className="flex cursor-grab items-center gap-3 rounded-md border bg-background p-3 hover:border-primary"
                draggable
                onDragStart={(event) => onDragStart(event, node.type!, node)}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-md`}>
                  {//@ts-ignore
                  node.data.icon && typeof node.data.icon === 'string' && Icons[node.data.icon] ? React.createElement(Icons[node.data.icon], { className: "h-4 w-4" }) : <StepForward className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{node.data.label}</h3>
                    {node.data.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {node.data.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{node.data.description}</p>
                </div>
              </div>
            )
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

