import { createClient, DeepgramClient } from "@deepgram/sdk";
import "dotenv/config";

let clientDeepgram: DeepgramClient;

export function deepgramClient() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error("API key is required to create Deepgram client.");
  }

  if (!clientDeepgram) {
    clientDeepgram = createClient(apiKey);
  }
  return clientDeepgram;
}
