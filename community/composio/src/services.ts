import { createCalendarEvent, initiateConnection, getExpectedParamsForUser, getEntityConnections, getEntity } from "./functions";
import { client } from "./client";

async function services() {
  const workflowsPath = require.resolve("./workflows");
  try {
    await Promise.all([
      // Start service with current workflows and functions
      client.startService({
        workflowsPath,
      }),
      // Start the composio service
      client.startService({
        taskQueue: "composio",
        functions: {
          createCalendarEvent,
          initiateConnection,
          getExpectedParamsForUser,
          getEntityConnections,
          getEntity,
        },
      }),
    ]);

    console.log("Services running successfully.");
  } catch (e) {
    console.error("Failed to run services", e);
  }
}

services().catch((err) => {
  console.error("Error running services:", err);
});
