import { FunctionFailure, log } from "@restackio/ai/function";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import z from "zod";
import { openaiClient } from "../utils/client";
import { Message } from "./llmChat";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

export type llmResponseInput = {
  systemContent?: string;
  model?: string;
  messages: Message[];
  workflowName: string;
  outputConditions: string[];
};

export const llmResponse = async ({
  messages,
  workflowName,
  outputConditions
}: llmResponseInput): Promise<string[]> => {
  try {
    const openai = openaiClient({});

    const responseFormat = zodResponseFormat(z.object({
      response: z.enum(outputConditions.length > 0 ? outputConditions as [string, ...string[]] : ["success", "failure"]),
    }), workflowName)

    const chatParams: ChatCompletionCreateParamsNonStreaming = {
      messages: messages,
      model: "gpt-4o-mini",
      response_format: responseFormat,
    };

    log.debug("LLM response completion params", {
      chatParams,
    });

    const completion = await openai.beta.chat.completions.parse(chatParams);

    const completionResponse = completion.choices[0].message.parsed;

    return completionResponse ?? [];
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error LLM response: ${error}`);
  }
};
