export function parseMetadata(metadataStr: string): any {
  try {
    return JSON.parse(metadataStr);
  } catch (error) {
    try {
      const normalized = metadataStr.replace(/'/g, '"');
      return JSON.parse(normalized);
    } catch (err2) {
      console.warn('Normalization failed, using default values:', err2);
      return {};
    }
  }
}

export function extractAgentInfo(metadata: any): { agentName: string, agentId: string, runId: string } {
  return {
    agentName: metadata.agent_name,
    agentId: metadata.agent_id,
    runId: metadata.run_id
  };
} 