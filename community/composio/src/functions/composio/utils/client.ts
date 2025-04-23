import { Composio } from "composio-core";

export const composioClient = ({
  composioApiKey = process.env.COMPOSIO_API_KEY,
}: {
  composioApiKey?: string;
}) => {
  return new Composio(composioApiKey);
};
