import { livekitDispatchClient } from '../utils/livekitDispatchClient';
import { AgentDispatch } from '@livekit/protocol';
import { FunctionFailure, log, functionInfo } from "@restackio/ai/function";

export const livekitDispatch = async ({roomName}: {roomName: string}): Promise<AgentDispatch> => {
  try {
    

   const agentName = functionInfo().workflowType
   const agentId = functionInfo().workflowExecution.workflowId
   const runId = functionInfo().workflowExecution.runId

    const client = livekitDispatchClient({});

    const dispatch = await client.createDispatch(roomName, 'livekit_pipeline', {
      metadata: JSON.stringify({
        agent_name: agentName,
        agent_id: agentId,
        run_id: runId
      })
    });
    log.info('dispatch created', dispatch);
    return dispatch
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error livekitDispatch: ${error}`);
  }
}