import { SipClient } from 'livekit-server-sdk';

import "dotenv/config";

let livekitSipInstance: SipClient | null = null;

export const livekitSipClient = ({
  url = process.env.LIVEKIT_URL,
  apiKey = process.env.LIVEKIT_API_KEY,
  apiSecret = process.env.LIVEKIT_API_SECRET

}: {
  url?: string;
  apiKey?: string;
  apiSecret?: string;
}): SipClient => {
  if (!url || !apiKey || !apiSecret) {
    throw new Error("API key is required to create livekit client.");
  }

  if (!livekitSipInstance) {
    livekitSipInstance = new SipClient(url, apiKey, apiSecret);

  }
  return livekitSipInstance;
};
