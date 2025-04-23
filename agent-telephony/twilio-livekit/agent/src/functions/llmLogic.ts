import { FunctionFailure, streamToWebsocket } from "@restackio/ai/function";

import { openaiClient } from "../utils/openaiClient";

import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Message } from "./llmTalk";

export type LLmLogicInput = {
  messages: Message[];
  documentation?: string;
};

const LlmLogicResponse = z.object({
  action: z.enum(["interrupt", "update_context", "end_call"]),
  reason: z.string(),
  updated_context: z.string(),
});

export type LlmLogicResponse = z.infer<typeof LlmLogicResponse>;

export const llmLogic = async ({
  messages,
  documentation,

}: LLmLogicInput): Promise<LlmLogicResponse> => {
  try {
    const openai = openaiClient({});
    const userMessages = messages.filter(msg => msg.role === "user");
    const voiceMailDetection = (userMessages.length === 1) ? "End the call if a voice mail is detected." : "";

    const systemPrompt = `
        Analyze the developer's questions and determine if an interruption is needed.
        Use the Restack documentation for accurate answers. 
        Track what the developer has learned and update their belief state.
        Do not re-explain everything, just deliver the most important update. Keep your answer short in max 20 words unless the user asks for more information.
        ${voiceMailDetection}
        Restack Documentation: ${documentation}
    `

    messages.unshift({
      role: "system",
      content: systemPrompt,
    });

    

      const completion = await openai.beta.chat.completions.parse({
        messages,
        model: "gpt-4o",
        response_format: zodResponseFormat(LlmLogicResponse, "logic"),
      });

      const logic = completion.choices[0].message.parsed;

      if (!logic) {
        throw FunctionFailure.nonRetryable("No logic response from OpenAI");
      }

      return logic;

    
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error OpenAI chat: ${error}`);
  }
};
