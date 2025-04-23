import { AutoSubscribe, cli, WorkerOptions } from '@livekit/agents';

import {
  type JobContext,
  type JobProcess,
  defineAgent,
  metrics,
  
} from '@livekit/agents';
import * as silero from '@livekit/agents-plugin-silero';
import { VPAEvent } from '@livekit/agents/dist/pipeline/pipeline_agent.js';
import { RoomEvent } from '@livekit/rtc-node';

import { parseMetadata, extractAgentInfo } from './utils.js';
import { getRestackAgentUrl } from './restack/utils.js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { livekitPipeline } from './pipeline.js';
import { setupPipelineMetrics } from './metrics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });


export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    console.log("Prewarming: loading VAD model...")
    proc.userData.vad = await silero.VAD.load();
    console.log("VAD model loaded successfully.")
  },
  entry: async (ctx: JobContext) => {

    try {
      const metadata = parseMetadata(ctx.job.metadata);
      console.log('metadata', metadata);

      const { agentName, agentId, runId } = extractAgentInfo(metadata);
      const agentUrl = getRestackAgentUrl(agentName, agentId, runId);

      console.log('agentUrl', agentUrl);

      if (!agentId || !agentUrl) {
        throw new Error('Missing agent info computed from metadata');
      }
      
      await ctx.connect(undefined, AutoSubscribe.AUDIO_ONLY);
      
      const participant = await ctx.waitForParticipant();

      console.log('Starting voice assistant for participant: ', participant.identity);

      const pipeline = livekitPipeline(ctx, agentId, agentUrl);

      setupPipelineMetrics(pipeline, agentId, runId);

      ctx.room.on(RoomEvent.DataReceived, (data: any) => {
        console.info("Received data: %o", data);
        const byteContent = data.data;
        if (Buffer.isBuffer(byteContent)) {
          const textData = byteContent.toString("utf-8");
          console.info("Text data: %s", textData);
          pipeline.say(textData, true);
        } else {
          console.warn("Data is not in bytes format.");
        }
      });

      pipeline.start(ctx.room, participant);

      console.timeLog("Pipeline started", ctx.job.metadata)

      const welcomeMessage =  "Welcome to restack, how can I help you today?"

      await pipeline.say(welcomeMessage, true)

    } catch (error) {
      console.error('Error in livekitPipeline', error);
    }
  }
});

cli.runApp(new WorkerOptions({
  agentName: 'livekit_pipeline',
  agent: fileURLToPath(import.meta.url),
})); 