import { FunctionFailure, streamToWebsocket } from "@restackio/ai/function";

import { openaiClient } from "../utils/openaiClient";
import { apiAddress } from "../client";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmTalkInput = {
  messages: Message[];
  context?: string;
  mode?: "default" | "interrupt";
  stream?: boolean;
};

export const llmTalk = async ({
  messages,
  context,
  mode = "default",
  stream = true,
}: LlmTalkInput): Promise<Message> => {
  try {
    const openai = openaiClient({});

    let systemPrompt = "";

    const commonPrompt = `
      Your are an AI assistant helping developers build with restack: the backend framework for accurate & reliable AI agents.
      Your interface with users will be voice. Be friendly, helpful and avoid usage of unpronouncable punctuation.
      Always try to bring back the conversation to restack if the user is talking about something else.
      Current context: ${context}
  `

    if (mode == "default") {
      systemPrompt = `  
        ${commonPrompt}
        If you don't know an answer, **do not make something up**. Instead, be friendly andacknowledge that 
        you will check for the correct response and let the user know. Keep your answer short in max 20 words
      `
    } else {
      systemPrompt = `
        ${commonPrompt}
        You are providing a short and precise update based on new information. 
        Do not re-explain everything, just deliver the most important update. Keep your answer short in max 20 words unless the user asks for more information.
      `
    }

    messages.unshift({
      role: "system",
      content: systemPrompt,
    });


    if (stream) {

      const completion = await openai.chat.completions.create({
        messages,
        model: "gpt-3.5-turbo",
        stream: true  
      });

      const assistantContent = await streamToWebsocket({
        apiAddress,
        data: completion,
      });

    return {
        role: "assistant",
        content: assistantContent,
      };
    } else {

      const completion = await openai.chat.completions.create({
        messages,
        model: "gpt-3.5-turbo"
      });

      return {
        role: "assistant",
        content: completion.choices[0].message.content ?? "",
      }
    }
    
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error OpenAI chat: ${error}`);
  }
};
