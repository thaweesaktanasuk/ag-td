export function getRestackAgentUrl(agentName: string, agentId: string, runId: string): string {
  const agentBackendHost = process.env.AGENT_BACKEND_HOST || 'http://localhost:9233';
  return `${agentBackendHost}/stream/agents/${agentName}/${agentId}/${runId}`;
} 