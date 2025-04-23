import { openAiToolsetClient } from "./utils/toolsets";

export async function getExpectedParamsForUser({
  composioApiKey,
  app,
  authScheme,
  entityId,
}: {
  composioApiKey?: string;
  app: string;
  authScheme?:
    | "OAUTH2"
    | "OAUTH1"
    | "API_KEY"
    | "BASIC"
    | "BEARER_TOKEN"
    | "BASIC_WITH_JWT";
  entityId?: string;
}) {
  const toolset = openAiToolsetClient({ composioApiKey, entityId });
  const response = await toolset.getExpectedParamsForUser({
    app,
    ...(authScheme && { authScheme }),
    ...(entityId && { entityId }),
  });

  return response.expectedInputFields;
}
