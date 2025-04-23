import { livekitRoomClient } from '../utils/livekitRoomClient';
import { FunctionFailure, log, functionInfo } from "@restackio/ai/function";

export const livekitDeleteRoom = async (): Promise<boolean> => {
  try {
    const roomName = functionInfo().workflowExecution.runId
    const client = livekitRoomClient({});

    await client.deleteRoom(roomName);
    log.info('livekitRoom deleted');
    return true
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error livekitDeleteRoom: ${error}`);
  }
}