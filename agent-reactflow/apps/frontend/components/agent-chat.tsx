"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { X, Send, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { ScrollArea } from "./ui/scroll-area"
import { useChat } from '@ai-sdk/react'
import { Node, Edge, ReactFlowInstance } from "@xyflow/react"
import { workflowData } from "../lib/workflowData"
import { runAgent } from "../app/actions/agent"
import Link from "next/link"

interface AgentChatProps {
  onClose: () => void
  reactFlowInstance: ReactFlowInstance
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
}

// Sub-component for Chat Messages
function ChatMessages({ agentId, runId, currentFlow, workflowData, setNodes, setEdges }: {
  agentId?: string;
  runId?: string;
  currentFlow: any;
  workflowData: any;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}) {
  const { messages, input, setInput, append } = useChat({
    body: {
      agentId,
      runId,
    },
    initialMessages: [
      {
        id: "1",
        role: "system",
        content: "You are a helpful assistant that create flows. The current flow is: " + JSON.stringify(currentFlow) + ". You are limited to the following nodes: " + JSON.stringify(workflowData) + ". Always use reactflow tool to update flow. Make sure to ask questions or clarification from user before updating flow."
      }
    ]
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      append({ content: input, role: 'user' });
      setInput("");
    }
  };

  return (
    <>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.filter(message => message.role != "system").map(message => (
            <div key={message.id} className="space-y-2 w-[350px]">
              {message.parts.map((part, index) => {
                switch (part.type) {
                  case 'text':
                    return <div key={index}>
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user" ? "bg-muted-foreground/10" : ""
                        }`}
                        style={{ wordWrap: "break-word", overflowWrap: "break-word",}}
                      >
                        <div className="">
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>;
                  case 'tool-invocation': {
                    const callId = part.toolInvocation.toolCallId;
    
                    switch (part.toolInvocation.toolName) {
                      case 'updateFlow': {
                        switch (part.toolInvocation.state) {
                          // example of pre-rendering streaming tool calls:
                          case 'partial-call':
                            return (
                              <div className="text-xs space-y-2" key={callId}>
                                <p>Updating flow...</p>
                                <pre className="text-xs max-h-52 overflow-y-auto p-4 bg-muted-foreground/10 rounded-md overflow-hidden">
                                  {JSON.stringify(part.toolInvocation, null, 2)}
                                </pre>
                              </div>
                            );
                          case 'call':
                            return (
                              <div className="text-xs" key={callId}>
                                Updating flow...
                              </div>
                            );
                          case 'result':
                            return (
                              <div key={callId} className="space-y-2">
                                <pre className="text-xs max-h-52 overflow-y-auto p-4 bg-muted-foreground/10 rounded-md overflow-hidden">
                                {JSON.stringify(part.toolInvocation.result.flow, null, 2)}
                                </pre>
                                <Button variant="default" className="w-full bg-foreground text-background" onClick={() => {
                                  // @ts-ignore
                                  setNodes(part.toolInvocation.result.flow.nodes);
                                  // @ts-ignore
                                  setEdges(part.toolInvocation.result.flow.edges);
                                }}>
                                  Apply
                                </Button>
                              </div>
                            );
                        }
                      }
                    }
                  }
                }
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 border-t p-4 space-y-4">
        <div className="flex items-end gap-2">
          <Button onClick={() => {
            append({ content: "create an agent to verify user's identity. first step id verification, if success end the flow, if person under 35 second step manual verification", role: 'user' })
            setInput("")
          }} className="text-xs w-full bg-muted text-muted-ackground">
            <Sparkles className="h-2 w-2" /> Verify young users
          </Button>
          <Button onClick={() => {
            append({ content: "create an agent to verify user's identity. first step id verification, if user is german end the flow, if person from switzerland second step manual verification", role: 'user' })
            setInput("")
          }} className="text-xs w-full bg-muted text-muted-background">
            <Sparkles className="h-2 w-2" /> Verify german users
          </Button>
        </div>
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Ask the assistant..."
            className="min-h-[80px] flex-1 resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button size="icon" onClick={() => {
            append({ content: input, role: 'user' })
            setInput("")
          }} className="bg-foreground text-background">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

export default function AgentChat({ onClose, reactFlowInstance, setNodes, setEdges }: AgentChatProps) {

  const [agentId, setAgentId] = useState<string>("");
  const [runId, setRunId] = useState<string>("");

  useEffect(() => {
    const createAgentChat = async () => {
      const { agentId, runId } = await runAgent({
        agentName: "agentChat",
        input: {  },
      })
      setAgentId(agentId);  
      setRunId(runId);
    }
    createAgentChat();
  }, []);


  const currentFlow = reactFlowInstance?.toObject();

  return (
    <div className="absolute left-0 top-0 flex h-full w-96 flex-col border-r bg-background shadow-lg">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <h2 className="text-lg font-semibold">AI assistant</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {runId && <div className="m-4 p-4 text-xs bg-muted-foreground/10 rounded-md overflow-hidden space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase text-muted-foreground">Dev debug info</p>
          <Link href={`http://localhost:5233/runs/${agentId}/${runId}?scheduledEventId=1`} target="_blank" className="text-xs underline text-muted-foreground hover:text-foreground">Open on Restack</Link>
        </div>
        <pre>{JSON.stringify({agentId, runId}, null, 2)}</pre>
        
      </div>}
      <ChatMessages agentId={agentId} runId={runId} currentFlow={currentFlow} workflowData={workflowData} setNodes={setNodes} setEdges={setEdges} />
    </div>
  )
}

