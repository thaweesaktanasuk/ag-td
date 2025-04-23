import { FunctionFailure, log } from "@restackio/ai/function";

export const fetchDocsContent = async (): Promise<string> => {
  const url = "https://docs.restack.io/llms-full.txt";
  try {
    const response = await fetch(url);
    log.info("Fetched docs content response", { status: response.status });
    if (!response.ok) {
      log.error("Failed to fetch docs content", { status: response.status });
      throw new Error(`Failed to fetch docs content with status ${response.status}`);
    }
    const content = await response.text();
    log.info("Fetched docs content", { content: content.substring(0, 100) });
    return content;
  } catch (error) {
    log.error("Error fetching docs content", { error });
    throw FunctionFailure.nonRetryable(`Error fetching docs content: ${error}`);
  }
};
