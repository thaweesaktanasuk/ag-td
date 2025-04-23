import {
  step,
  log,
  condition,
  startChild,
  workflowInfo,
} from "@restackio/ai/workflow";
import { onEvent } from "@restackio/ai/event";
import * as functions from "../../functions";
import { conversationWorkflow } from "../conversation/conversation";
import {
  audioInEvent,
  userEvent,
  streamEndEvent,
  RoomInfo,
  streamInfoEvent,
  UserEvent,
  roomMessageEvent,
} from "./events";
import { streamEvent } from "../conversation/events";
import { StreamEvent } from "../../functions/openai/types";
import { WebsocketEvent } from "../../functions/websocket/types";

export async function roomWorkflow({ address }: { address?: string }) {
  try {
    let currentstreamSid: string;
    let interactionCount = 0;
    let audioQueue: {
      audio: string;
      text: string;
    }[] = [];
    let isSendingAudio = false;
    let childConversationWorkflowRunId = "";

    const assistantName = "agent";

    console.log("address", address);
    // Start long running websocket and stream welcome message to websocket.
    onEvent(streamInfoEvent, async ({ streamSid }: RoomInfo) => {
      log.info(`Workflow update with streamSid: ${streamSid}`);
      step<typeof functions>({
        taskQueue: "websocket",
        scheduleToCloseTimeout: "1 hour",
        heartbeatTimeout: "2 minutes",
      }).websocketListen({
        streamSid,
        address,
        events: [
          {
            websocketEventName: "media",
            workflowEventName: audioInEvent.name,
          },
          {
            websocketEventName: "stop",
            workflowEventName: streamEndEvent.name,
          },
        ],
      });

      const welcomeMessage = "Hello! I am Pete from Apple.";

      const { media } = await step<typeof functions>({
        taskQueue: "deepgram",
      }).deepgramSpeak({
        text: welcomeMessage,
        twilioEncoding: true,
      });

      await step<typeof functions>({
        taskQueue: "websocket",
      }).websocketSend({
        name: "media",
        input: {
          streamSid,
          media: {
            trackId: assistantName,
            payload: media.payload,
          },
        },
        address,
      });

      await step<typeof functions>({
        taskQueue: "websocket",
      }).websocketSend({
        name: roomMessageEvent.name,
        input: {
          streamSid,
          data: { trackId: assistantName, text: welcomeMessage },
        },
        address,
      });

      currentstreamSid = streamSid;
      return { streamSid };
    });

    // Receives audio, transcribe it and send transcription to conversation with AI .

    onEvent(audioInEvent, async ({ streamSid, media }: WebsocketEvent) => {
      log.info(`Workflow update with streamSid: ${streamSid}`);

      if (!media?.payload || media.trackId === assistantName) return;

      const { result } = await step<typeof functions>({
        taskQueue: "deepgram",
      }).deepgramListen({
        base64Payload: media?.payload,
        twilioEncoding: true,
      });

      const transcript = result?.results.channels[0].alternatives[0].transcript;

      if (!transcript?.length) {
        const input: StreamEvent = {
          response: "Sorry i didn't understand. Can you repeat?",
          assistantName,
          isLast: true,
        };

        log.info("Answer to transcript ", { input });

        await step<typeof functions>({}).workflowSendEvent({
          event: {
            name: roomMessageEvent.name,
            input,
          },
          workflow: {
            workflowId: workflowInfo().workflowId,
            runId: workflowInfo().runId,
          },
        });
      }

      interactionCount += 1;

      step<typeof functions>({
        taskQueue: "websocket",
      }).websocketSend({
        name: userEvent.name,
        input: {
          streamSid,
          data: {
            trackId: media.trackId,
            text: transcript,
          },
        },
        address,
      });

      if (!childConversationWorkflowRunId) {
        const childWorkflow = await startChild(conversationWorkflow, {
          args: [
            {
              assistantName,
              userName: media.trackId,
              message: transcript!,
            },
          ],
          workflowId: `${streamSid}-conversationWorkflow`,
        });
        childConversationWorkflowRunId = childWorkflow.firstExecutionRunId;
      } else {
        const input: UserEvent = {
          userName: media.trackId,
          message: transcript!,
        };
        step<typeof functions>({
          taskQueue: `restack`,
        }).workflowSendEvent({
          event: {
            name: userEvent.name,
            input,
          },
          workflow: {
            workflowId: `${streamSid}-conversationWorkflow`,
            runId: childConversationWorkflowRunId,
          },
        });
      }
      return { streamSid };
    });

    // Receives AI answer, generates audio and stream it to websocket.

    onEvent(
      streamEvent,
      async ({ response, isLast, assistantName }: StreamEvent) => {
        const { media } = await step<typeof functions>({
          taskQueue: "deepgram",
        }).deepgramSpeak({
          text: response,
          twilioEncoding: true,
        });

        audioQueue.push({ audio: media.payload, text: response });

        if (!isSendingAudio && isLast) {
          isSendingAudio = true;

          while (audioQueue.length > 0) {
            const { audio } = audioQueue.shift()!;

            await step<typeof functions>({
              taskQueue: "websocket",
            }).websocketSend({
              name: "media",
              input: {
                streamSid: currentstreamSid,
                media: {
                  trackId: assistantName!,
                  payload: audio,
                },
              },
              address,
            });
          }

          await step<typeof functions>({
            taskQueue: "websocket",
          }).websocketSend({
            name: roomMessageEvent.name,
            input: {
              streamSid: currentstreamSid,
              data: { trackId: assistantName!, text: response },
            },
            address,
          });

          isSendingAudio = false;
        }

        return { response };
      }
    );

    // Terminates stream workflow.

    let ended = false;

    onEvent(streamEndEvent, async () => {
      log.info(`streamEnd received`);
      ended = true;
    });

    await condition(() => ended);

    return;
  } catch (error) {
    log.error("Error in streamRoom", { error });
    throw error;
  }
}
