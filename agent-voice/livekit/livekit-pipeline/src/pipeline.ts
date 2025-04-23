import {
  type JobContext,
  type JobProcess,
  WorkerOptions,
  cli,
  defineAgent,
  pipeline,
  // metrics,
  llm
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
// import { ParticipantKind } from '@livekit/rtc-node';
// import { isLLMMetrics, isPipelineEOUMetrics, isTTSMetrics } from '@livekit/agents/src/metrics/utils';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    console.log(`get job restack metadata: ${ctx.job.metadata}`);

    let metadata;
    try {
      metadata = JSON.parse(ctx.job.metadata);
    } catch (error) {
      try {
        const normalized = ctx.job.metadata.replace(/'/g, '"');
        metadata = JSON.parse(normalized);
      } catch (error2) {
        console.warn('Normalization failed, using default values:', error2);
        metadata = {};
      }
    }

    const agentName = metadata.agent_name
    const agentId = metadata.agent_id
    const runId = metadata.run_id

    const agentBackendHost = process.env.AGENT_BACKEND_HOST || 'http://host.docker.internal:9233';

    const agentUrl = `${agentBackendHost}/stream/agents/${agentName}/${agentId}/${runId}`;

    console.log(`agent url: ${agentUrl}`);

    const vad = ctx.proc.userData.vad! as silero.VAD;

    await ctx.connect();
    const participant = await ctx.waitForParticipant();

    // If outbound call add the agentId to the participant
    // const participant = await ctx.waitForParticipant(agentId);

    const pipelineAgent = new pipeline.VoicePipelineAgent(
      vad,
      new deepgram.STT(),
      
      new openai.LLM({
        // apiKey is not used as the agent will use its own apiKey
        apiKey: `${agentId}-livekit`,
        baseURL: agentUrl
      }),
      
      new elevenlabs.TTS(),
      {

        // Solve issue when interrupting the LLM https://github.com/livekit/agents-js/issues/233#issuecomment-2622547863
        beforeLLMCallback: async (agent, chatCtx) => {
          return agent.llm.chat({
            chatCtx: Object.assign(new llm.ChatContext(), {
              ...chatCtx,
              messages: chatCtx.messages.filter(
                m => m.content || m.toolCalls || m.toolCallId || m.toolException
              )
            }),
            fncCtx: agent.fncCtx
          })
        },
    },
    );


    // TODO metrics

    // const usageCollector = new metrics.UsageCollector();

    // pipelineAgent.on(pipeline.VPAEvent.METRICS_COLLECTED, (mtrcs: metrics.AgentMetrics) => {
    //   metrics.logMetrics(mtrcs);
    //   usageCollector.collect(mtrcs);

    //   // let totalLatency = 0;
    //   // let endOfUtteranceDelay = 0;
    //   // let llmTtft = 0;
    //   // let ttsTtfb = 0;

    //   // if (isLLMMetrics(mtrcs)) {
    //   //   llmTtft = mtrcs.ttft;
    //   // }
    //   // if (isTTSMetrics(mtrcs)) {
    //   //   ttsTtfb = mtrcs.ttfb;
    //   // }

    //   // if (isPipelineEOUMetrics(mtrcs)) {
    //   //   endOfUtteranceDelay = mtrcs.endOfUtteranceDelay;
    //   // }

    //   // totalLatency = endOfUtteranceDelay + llmTtft + ttsTtfb;

    //   // console.log(usageCollector.summary);
    //   // console.log(`total latency: ${totalLatency}`);

    // })

    pipelineAgent.start(ctx.room, participant);
  },
});

// agentName is to manually dispatch the agent
cli.runApp(new WorkerOptions({ agentName:'AgentStream', agent: fileURLToPath(import.meta.url) }));
