import { FunctionFailure, log, streamToWebsocket } from "@restackio/ai/function";
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionCreateParamsStreaming } from "openai/resources/chat/completions";

import { openaiClient } from "../utils/client";
import { apiAddress } from "../client";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAIChatInput = {
  systemContent?: string;
  model?: string;
  messages: Message[];
  stream?: boolean;
  tools?: any;
};

export const llmChat = async ({
  systemContent = "",
  model = "gpt-4o",
  messages,
  stream = true,
  tools,
}: OpenAIChatInput): Promise<Message> => {
  try {
    const openai = openaiClient({});

    if (stream) {

      const chatParams: ChatCompletionCreateParamsStreaming = {
        messages: [
          ...(systemContent
            ? [{ role: "system" as const, content: systemContent }]
            : []),
          ...(messages ?? []),
        ],
        tools,
        model,
        stream,
      };
  
      log.debug("OpenAI chat completion params", {
        chatParams,
      });

      const completion = await openai.chat.completions.create(chatParams);

      log.debug("OpenAI chat completion", {
        completion,
      });


      const assistantContent = await streamToWebsocket({
        apiAddress,
        data: completion,
      });

      log.debug("Assistant content", {
        assistantContent,
      });

      return {
        role: "assistant",
        content: assistantContent,
      };
      
    } else {
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
    }
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error OpenAI chat: ${error}`);
  }
};
