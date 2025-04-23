import { RoomServiceClient } from 'livekit-server-sdk';

import "dotenv/config";

let livekitRoomInstance: RoomServiceClient | null = null;

export const livekitRoomClient = ({
  url = process.env.LIVEKIT_URL,
  apiKey = process.env.LIVEKIT_API_KEY,
  apiSecret = process.env.LIVEKIT_API_SECRET

}: {
  url?: string;
  apiKey?: string;
  apiSecret?: string;
}): RoomServiceClient => {
  if (!url || !apiKey || !apiSecret) {
    throw new Error("API key is required to create livekit client.");
  }

  if (!livekitRoomInstance) {
    livekitRoomInstance = new RoomServiceClient(url, apiKey, apiSecret);

  }
  return livekitRoomInstance;
};
