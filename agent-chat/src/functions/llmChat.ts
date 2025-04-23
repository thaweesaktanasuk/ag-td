import { FunctionFailure, log } from "@restackio/ai/function";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";

import { openaiClient } from "../utils/client";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAIChatInput = {
  systemContent?: string;
  model?: string;
  messages: Message[];
};

export const llmChat = async ({
  systemContent = "",
  model = "deepseek-chat",
  messages,
}: OpenAIChatInput): Promise<Message> => {
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

    return {
      role: message.role,
      content: message.content ?? "",
    };
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error OpenAI chat: ${error}`);
  }
};
