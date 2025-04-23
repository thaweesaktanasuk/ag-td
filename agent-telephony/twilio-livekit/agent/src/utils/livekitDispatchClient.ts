import { AgentDispatchClient } from 'livekit-server-sdk';

import "dotenv/config";

let livekitDispatchInstance: AgentDispatchClient | null = null;

export const livekitDispatchClient = ({
  url = process.env.LIVEKIT_URL,
  apiKey = process.env.LIVEKIT_API_KEY,
  apiSecret = process.env.LIVEKIT_API_SECRET

}: {
  url?: string;
  apiKey?: string;
  apiSecret?: string;
}): AgentDispatchClient => {
  if (!url || !apiKey || !apiSecret) {
    throw new Error("API key is required to create livekit client.");
  }

  if (!livekitDispatchInstance) {
    livekitDispatchInstance = new AgentDispatchClient(url, apiKey, apiSecret);

  }
  return livekitDispatchInstance;
};
