import { FunctionFailure, log } from "@restackio/ai/function";
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionAssistantMessageParam,
} from "openai/resources/chat/completions";

import { openaiClient } from "../utils/client";

export type Message =
  | ChatCompletionSystemMessageParam
  | ChatCompletionUserMessageParam
  | ChatCompletionAssistantMessageParam;

export type OpenAIChatInput = {
  systemContent?: string;
  model?: string;
  messages: Message[];
};

export const llmChat = async ({
  systemContent = "",
  model = "gpt-4o-mini",
  messages,
}: OpenAIChatInput): Promise<string> => {
  try {
    const openai = openaiClient({});

    const chatParams: ChatCompletionCreateParamsNonStreaming = {
      messages: [
        ...(systemContent
          ? [{ role: "system" as const, content: systemContent }]
          : []),
        ...(messages ?? []),
      ],
      model,
    };

    log.debug("OpenAI chat completion params", {
      chatParams,
    });

    const completion = await openai.chat.completions.create(chatParams);

    const message = completion.choices[0].message;

    return message.content ?? "";
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error OpenAI chat: ${error}`);
  }
};
