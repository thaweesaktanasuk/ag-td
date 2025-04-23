import {
  posthogGetRecordings,
  posthogGetSnapshotBlob,
  posthogGetSnapshots,
  posthogBlobChunks,
  posthogSessionEvents,
  workflowSendEvent,
  linearCreateComment,
  linearCreateIssue,
  openaiChatCompletionsBase,
  openaiChatCompletionsStream,
} from "./functions";
import { client } from "./client";

async function services() {
  const workflowsPath = require.resolve("./workflows");

  try {
    // https://posthog.com/docs/api#rate-limiting

    await Promise.all([
      client.startService({
        workflowsPath,
        functions: {
          workflowSendEvent,
        },
      }),
      client.startService({
        taskQueue: "posthog",
        functions: {
          posthogGetRecordings,
          posthogGetSnapshotBlob,
          posthogGetSnapshots,
          posthogBlobChunks,
          posthogSessionEvents,
        },
        options: {
          rateLimit: 240 * 60,
        },
      }),
      client.startService({
        taskQueue: "openai",
        functions: {
          openaiChatCompletionsBase,
          openaiChatCompletionsStream,
        },
        options: {
          rateLimit: 240 * 60,
        },
      }),
      client.startService({
        taskQueue: "openai-beta",
        functions: {
          openaiChatCompletionsBase,
          openaiChatCompletionsStream,
        },
        options: {
          rateLimit: 240 * 60,
        },
      }),
      client.startService({
        taskQueue: "linear",
        functions: {
          linearCreateComment,
          linearCreateIssue,
        },
        options: {
          rateLimit: 240 * 60,
        },
      }),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run worker", e);
  }
}

services().catch((err) => {
  console.error("Error running services:", err);
});
