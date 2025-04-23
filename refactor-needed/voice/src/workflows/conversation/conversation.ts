import { step, log, workflowInfo, condition } from "@restackio/ai/workflow";
import * as functions from "../../functions";
import { onEvent } from "@restackio/ai/event";
import { streamEvent, toolCallEvent, conversationEndEvent } from "./events";
import { UserEvent, userEvent } from "../room/events";

import {
  StreamEvent,
  ToolCallEvent,
} from "../../functions/openai/types";
import { agentPrompt } from "../../functions/openai/prompt";
import {
  ChatModel,
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/index";

export async function conversationWorkflow({
  assistantName,
  userName,
  message,
}: {
  assistantName: string;
  userName: string;
  message: string;
}) {
  try {
    const parentWorkflow = workflowInfo().parent;
    if (!parentWorkflow) throw "no parent Workflow";

    let openaiChatMessages: ChatCompletionMessageParam[] = [];

    const tools = await step<typeof functions>({
      taskQueue: "erp",
    }).erpGetTools();

    const model: ChatModel = "gpt-4o-mini";

    const commonOpenaiOptions = {
      model,
      assistantName,
      tools,
      streamAtCharacter: "•",
      streamEvent: {
        workflowEventName: streamEvent.name,
        workflow: parentWorkflow,
      },
      toolEvent: {
        workflowEventName: toolCallEvent.name,
      },
    };

    const response = await step<typeof functions>({
      taskQueue: "openai",
    }).openaiChatCompletionsStream({
      userName,
      newMessage: message,
      messages: agentPrompt,
      ...commonOpenaiOptions,
    });

    if (response?.result?.messages) {
      openaiChatMessages = response.result.messages;
    }

    onEvent(userEvent, async ({ message, userName }: UserEvent) => {
      const response = await step<typeof functions>({
        taskQueue: "openai",
      }).openaiChatCompletionsStream({
        newMessage: message,
        userName,
        messages: openaiChatMessages,
        ...commonOpenaiOptions,
      });

      if (response?.result?.messages) {
        openaiChatMessages = response.result.messages;
      }

      if (response?.result?.toolCalls) {
        response.result.toolCalls.map(async (toolCall) => {
          const toolResponse = `Sure, let me ${toolCall?.function?.name}...`;
          const toolMessage: ChatCompletionAssistantMessageParam = {
            content: toolResponse,
            role: "assistant",
          };
          openaiChatMessages.push(toolMessage);

          const input: StreamEvent = {
            response: toolResponse,
            assistantName,
            isLast: true,
          };

          log.info("toolCall ", { input });

          await step<typeof functions>({}).workflowSendEvent({
            event: {
              name: streamEvent.name,
              input,
            },
            workflow: parentWorkflow,
          });
        });
      }

      return { message };
    });

    onEvent(
      toolCallEvent,
      async ({ function: toolFunction }: ToolCallEvent) => {
        log.info("toolCallEvent", { toolFunction });

        async function callERPFunction(
          toolFunction: ToolCallEvent["function"]
        ) {
          const erpStep = step<typeof functions>({
            taskQueue: "erp",
          });

          switch (toolFunction.name) {
            case "checkPrice":
              return erpStep.erpCheckPrice(
                toolFunction.input as unknown as functions.PriceInput
              );
            case "checkInventory":
              return erpStep.erpCheckInventory(
                toolFunction.input as unknown as functions.InventoryInput
              );
            case "placeOrder":
              return erpStep.erpPlaceOrder(
                toolFunction.input as unknown as functions.OrderInput
              );
            default:
              throw new Error(`Unknown function name: ${toolFunction.name}`);
          }
        }

        const toolResult = await callERPFunction(toolFunction);

        openaiChatMessages.push({
          content: JSON.stringify(toolResult),
          role: "function",
          name: toolFunction.name,
        });

        const response = await step<typeof functions>({
          taskQueue: "openai",
        }).openaiChatCompletionsStream({
          messages: openaiChatMessages,
          ...commonOpenaiOptions,
        });

        if (response?.result?.messages) {
          openaiChatMessages = response.result.messages;
        }

        return { function: toolFunction };
      }
    );

    let ended = false;
    onEvent(conversationEndEvent, async () => {
      log.info(`conversationEndEvent received`);
      ended = true;
    });

    await condition(() => ended);

    return;
  } catch (error) {
    log.error("Error in conversationWorkflow", { error });
    throw error;
  }
}