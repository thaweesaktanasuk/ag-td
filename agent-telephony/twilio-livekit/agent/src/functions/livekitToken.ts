import { AccessToken } from 'livekit-server-sdk';

import "dotenv/config";
import { FunctionFailure } from '@restackio/ai/function';

export const livekitToken = async ({roomName}: {roomName: string}): Promise<string> => {

  try {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("API key is required to create livekit client.");
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: ''
  });

  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: 'identity',
    name: 'dev-user',
    ttl: '60m',
  });
  at.addGrant({ roomJoin: true, room: roomName });

  return await at.toJwt();

  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error creating livekit token: ${error}`);
  }
};
