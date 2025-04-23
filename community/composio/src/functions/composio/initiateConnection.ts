import { FunctionFailure, log } from "@restackio/ai/function";

import { getEntity } from "./getEntity";

export async function initiateConnection({
  entityId,
  appName,
  composioApiKey,
  waitUntilActive,
}: {
  entityId: string;
  appName: string;
  composioApiKey?: string;
  waitUntilActive?: number;
}) {
  const entity = await getEntity({ composioApiKey, entityId });

  const entityAppConnection = await entity.getConnection(appName);

  if (entityAppConnection) {
    return {
      authenticated: true,
      message: `Already connected to ${appName}`,
      redirectUrl: entityAppConnection.redirectUrl,
    };
  }

  const connection = await entity.initiateConnection(appName);

  if (!waitUntilActive) {
    return {
      authenticated: false,
      message: `User needs to follow redirect URL to authenticate: ${connection.redirectUrl}`,
      redirectUrl: connection.redirectUrl,
    };
  }

  try {
    await connection.waitUntilActive(waitUntilActive);
    return {
      authenticated: true,
      message: `Connected to ${appName}`,
      redirectUrl: connection.redirectUrl,
    };
  } catch (error) {
    log.error("User did not authenticate in time for application", {
      appName,
      error,
    });

    return {
      authenticated: false,
      message: `User did not authenticate in time for application: ${appName}`,
      redirectUrl: connection.redirectUrl,
    };
  }
}
