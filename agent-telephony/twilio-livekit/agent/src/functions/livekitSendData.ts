import { livekitRoomClient } from '../utils/livekitRoomClient';
import { FunctionFailure, log } from "@restackio/ai/function";
import { DataPacket_Kind } from '@livekit/protocol';

export const livekitSendData = async ({roomName, text}: {roomName: string, text: string}): Promise<boolean> => {
  try {
    const client = livekitRoomClient({});

    const data = new TextEncoder().encode(text);

    await client.sendData(roomName, data, DataPacket_Kind.RELIABLE, {});
    log.info('livekitSendData sent');
    return true
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error livekitSendData: ${error}`);
  }
}