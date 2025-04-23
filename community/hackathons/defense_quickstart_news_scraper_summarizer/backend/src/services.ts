// Simple example to start two services in the same file
import { config } from 'dotenv';
import { rssPull, llmChat, crawlWebsite, splitContent } from "./functions";
import { client } from "./client";

config();

export async function services() {
    const workflowsPath = require.resolve("./workflows");
    try {
        await Promise.all([
            // Generic service with current workflows and functions
            client.startService({
                workflowsPath,
                functions: {
                    rssPull,
                    crawlWebsite,
                    splitContent,
                },
            }),
            client.startService({
                taskQueue: 'llm',
                workflowsPath,
                functions: {
                    llmChat
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
