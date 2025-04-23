import { OpenAIToolSet } from "composio-core";

export function openAiToolsetClient({
  composioApiKey = process.env.COMPOSIO_API_KEY,
  entityId,
}: {
  composioApiKey?: string;
  entityId?: string;
}) {
  return new OpenAIToolSet({
    apiKey: composioApiKey,
    entityId,
  });
}
