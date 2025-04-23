import {
  defineEvent,
  onEvent,
  condition,
  log,
  step,
} from "@restackio/ai/agent";
import * as functions from "../functions";

const messagesEvent = defineEvent<functions.Message[]>("messages");
const endEvent = defineEvent("end");

type AgentChatOutput = {
  messages: functions.Message[];
};

export async function agentChat(): Promise<AgentChatOutput> {
  let endReceived = false;
  const messages: functions.Message[] = [];

  onEvent(messagesEvent, async ({ messages, tools, stream = true }: { messages: functions.Message[], tools: any, stream?: boolean }) => {
    const result = await step<typeof functions>({}).llmChat({
      messages,
      tools,
      stream
    });
    messages.push(result);
    return messages;
  });

  onEvent(endEvent, async () => {
    endReceived = true;
  });

  // We use the `condition` function to wait for the event goodbyeReceived to return `True`.
  await condition(() => endReceived);

  log.info("end condition met");
  return { messages };
}
