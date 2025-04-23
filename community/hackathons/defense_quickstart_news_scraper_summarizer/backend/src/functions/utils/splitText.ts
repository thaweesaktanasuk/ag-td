import { FunctionFailure } from "@restackio/ai/function";

export const splitContent = async ({
    content,
    maxTokens = 4096
}: {
    content: string,
    maxTokens?: number
}): Promise<{ result: string[] }> => {
    try {
        const chunkSize = Math.floor(maxTokens / 3); // Assuming ~3 tokens per character
        const chunks = [];

        for (let i = 0; i < content.length; i += chunkSize) {
            chunks.push(content.slice(i, i + chunkSize));
        }

        return { result: chunks };
    } catch (error) {
        throw FunctionFailure.nonRetryable(`Error split content: ${error}`);
    }
};