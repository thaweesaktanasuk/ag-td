import { Room } from 'livekit-server-sdk';
import { livekitRoomClient } from '../utils/livekitRoomClient';
import { FunctionFailure, log, functionInfo } from "@restackio/ai/function";

export const livekitCreateRoom = async (): Promise<Room> => {
  try {
    const roomName = functionInfo().workflowExecution.runId
    const client = livekitRoomClient({});


    const opts = {
      name: roomName,
      // timeout in seconds
      emptyTimeout: 10 * 60,
      maxParticipants: 20,
    };
    const room = await client.createRoom(opts);
    log.info('livekitRoom created', room);
    return room
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error livekitCreateRoom: ${error}`);
  }
}