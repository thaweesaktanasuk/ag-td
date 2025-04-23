import { FunctionFailure, log } from "@restackio/ai/function";
import { llmClient } from "./client";

export const llmChat = async ({
    userContent
}: { userContent: string }): Promise<{ result: string }> => {
    try {
        const llm = llmClient();

        const response = await llm.chat.completions.create({
            messages: [{ role: "user", content: userContent }],
            model: "orpo-mistral-v0.3-ua-tokV2-focus-10B-low-lr-1epoch-aux-merged-1ep",
        });

        if (!response.choices[0].message.content) {
            throw FunctionFailure.nonRetryable("No response from OpenBabylon");
        }

        return { result: response.choices[0].message.content || "" };
    } catch (error) {
        throw FunctionFailure.nonRetryable(`Error LLM chat: ${error}, llmClient: ${llmClient}`);
    }
};