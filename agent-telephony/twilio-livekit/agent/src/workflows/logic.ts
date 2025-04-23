import { log, sleep, step, workflowInfo } from "@restackio/ai/workflow";
import * as functions from "../functions";
import { Message } from "../functions/llmTalk";

interface LogicWorkflowInput {
  messages: Message[];
  roomName: string;
  context: string;
}


export async function logicWorkflow({ messages, roomName, context }: LogicWorkflowInput) {

  const agentId = workflowInfo().parent?.workflowId!
  const runId = workflowInfo().parent?.runId!

  const documentation = await step<typeof functions>({}).fetchDocsContent();

  const { action, reason, updated_context } = await step<typeof functions>({}).llmLogic({
    messages,
    documentation,
  });

  context = updated_context;

  await step<typeof functions>({}).sendAgentEvent({
    eventName: "context",
    eventInput: {
      context,
    },
    agentId,
    runId,
  });

  if (action === "interrupt") {
    const interruptResponse = await step<typeof functions>({}).llmTalk({
      messages: [{ role: "user", content: reason }],
      context,
      mode: "interrupt",
      stream: false,
    });

    await step<typeof functions>({}).livekitSendData({
      roomName,
      text: interruptResponse.content,
    });
  }

  if (action === "end_call") {
    log.info("Ending call", { reason });

    const goodbyeResponse = await step<typeof functions>({}).llmTalk({
      messages: [{ role: "user", content: "Say goodbye to the user by providing a unique and short message based on context.", }],
      context,
      mode: "interrupt",
      stream: false,
    });

    await step<typeof functions>({}).livekitSendData({
      roomName,
      text: goodbyeResponse.content,
    });

    await sleep(1000)

    await step<typeof functions>({}).sendAgentEvent({
      eventName: "end",
      eventInput: {
        end: true
      },
      agentId,
      runId,
    });
  }

  return context
}
