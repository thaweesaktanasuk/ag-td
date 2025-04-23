import { feedback, goodbye } from "./functions";
import { client } from "./client";

async function services() {
  const agentsPath = require.resolve("./agents");
  try {
    await Promise.all([
      // Start service with current workflows and functions
      client.startService({
        agentsPath,
        functions: { feedback, goodbye },
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
