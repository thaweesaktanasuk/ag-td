import { EgressClient } from 'livekit-server-sdk';

import "dotenv/config";

let livekitEgressInstance: EgressClient | null = null;

export const livekitEgressClient = ({
  url = process.env.LIVEKIT_URL,
  apiKey = process.env.LIVEKIT_API_KEY,
  apiSecret = process.env.LIVEKIT_API_SECRET

}: {
  url?: string;
  apiKey?: string;
  apiSecret?: string;
}): EgressClient => {
  if (!url || !apiKey || !apiSecret) {
    throw new Error("API key is required to create livekit client.");
  }

  if (!livekitEgressInstance) {
    livekitEgressInstance = new EgressClient(url, apiKey, apiSecret);

  }
  return livekitEgressInstance;
};
