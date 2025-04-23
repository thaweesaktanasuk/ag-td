import { openaiChatCompletionsBase } from "../openai";

import { openAiToolsetClient } from "./utils/toolsets";

export async function createCalendarEvent({
  entityId,
  composioApiKey,
  calendarInstruction,
}: {
  entityId?: string;
  composioApiKey?: string;
  calendarInstruction: string;
}) {
  const composioOpenAiClient = openAiToolsetClient({
    composioApiKey,
    entityId,
  });

  const tools = await composioOpenAiClient.getTools({
    actions: ["googlecalendar_create_event"],
  });

  const { result } = await openaiChatCompletionsBase({
    userContent: calendarInstruction,
    tools,
    toolChoice: "auto",
  });

  return composioOpenAiClient.handleToolCall(result);
}
