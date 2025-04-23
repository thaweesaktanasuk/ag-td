import { llm, weather } from "./functions";
import { client } from "./client";

async function services() {
  const workflowsPath = require.resolve("./workflows");
  try {
    await Promise.all([
      client.startService({
        workflowsPath,
        functions: { llm, weather },
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
