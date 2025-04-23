import { FunctionFailure } from "@restackio/ai/function";
import { Entity } from "composio-core/lib/src/sdk/models/Entity";

import { composioClient } from "./utils/client";

export async function getEntity({
  composioApiKey,
  entityId,
}: {
  composioApiKey?: string;
  entityId: string;
}): Promise<Entity> {
  const client = composioClient({ composioApiKey });
  console.log("client", client);
  try {
    const entity = client.getEntity(entityId);
    return entity;
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error getting entity: ${error}`);
  }
}
