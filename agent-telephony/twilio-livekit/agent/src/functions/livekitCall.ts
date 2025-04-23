import { livekitSipClient } from '../utils/livekitSipClient';
import { 
  SIPParticipantInfo,
} from '@livekit/protocol';
import { FunctionFailure, log } from "@restackio/ai/function";

export type LivekitCallParams = {
  sipTrunkId: string;
  phoneNumber: string;
  roomId: string;
  agentName: string;
  agentId: string;
  runId: string;
}

export const livekitCall = async ({sipTrunkId, phoneNumber, roomId, agentName, agentId, runId}: LivekitCallParams): Promise<SIPParticipantInfo> => {
  try {

    const roomName = roomId;
    const client = livekitSipClient({});

    const participantInfo = await client.createSipParticipant(sipTrunkId, phoneNumber, roomName, {
      participantIdentity: agentId,
      participantName: agentName,
      playDialtone: true,
    });

    log.info('livekitCall created', participantInfo);

    return participantInfo
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error livekitCall: ${error}`);
  }
}