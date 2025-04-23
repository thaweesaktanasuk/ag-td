import { metrics } from '@livekit/agents';
import { VoicePipelineAgent } from '@livekit/agents/dist/pipeline/pipeline_agent.js';
import { VPAEvent } from '@livekit/agents/dist/pipeline/pipeline_agent.js';
import { client } from './restack/client.js';


function sendMetrics(mtrcs: metrics.AgentMetrics, agentId: string, runId: string) {
  let latencies: number[] = [];
  if ('endOfUtteranceDelay' in mtrcs) {
    latencies.push((mtrcs as any).endOfUtteranceDelay * 1000);
  } else if ('ttft' in mtrcs) {
    latencies.push((mtrcs as any).ttft * 1000);
  } else if ('ttfb' in mtrcs) {
    latencies.push((mtrcs as any).ttfb * 1000);
  }
  const metricsLatencies = latencies.length ? JSON.stringify({ latencies }) : "";
  client.sendAgentEvent({
    event: {
      name: 'pipeline_metrics',
      input: {
        metrics: mtrcs,
        latencies: metricsLatencies,
      }
    },
    agent: {
      agentId,
      runId,
    }
  });
}

export function setupPipelineMetrics(pipeline: VoicePipelineAgent, agentId: string, runId: string) {
  try {
    const usageCollector = new metrics.UsageCollector();
    pipeline.on(VPAEvent.METRICS_COLLECTED, (mtrcs: metrics.AgentMetrics) => {
      metrics.logMetrics(mtrcs);
      usageCollector.collect(mtrcs);
      sendMetrics(mtrcs, agentId, runId);
    })
  } catch (error) {
    console.error('Error setting up pipeline metrics', error);
  }
} 