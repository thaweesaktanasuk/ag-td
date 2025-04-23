import { openAiToolsetClient } from "./utils/toolsets";

export async function getEntityConnections({
  entityId,
  composioApiKey,
}: {
  entityId: string;
  composioApiKey?: string;
}) {
  const toolSetClient = openAiToolsetClient({ composioApiKey, entityId });
  const connections = await toolSetClient.client.connectedAccounts.list({});
  return connections;
}