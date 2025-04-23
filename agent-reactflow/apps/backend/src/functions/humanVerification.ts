import { FunctionFailure, log } from "@restackio/ai/function";


export type HumanVerificationInput = {
  context: string;
};

export type HumanVerificationOutput = {
  status: "approved" | "declined";
};

export const humanVerification = async ({
  context,
}: HumanVerificationInput): Promise<HumanVerificationOutput> => {
  try {
    log.info("humanVerification input:", {input: {context}});

    // Simulate status response
    const statuses: HumanVerificationOutput['status'][] = ['approved', 'declined'];
    const randomStatusIndex = Math.floor(Math.random() * statuses.length);
    const status = statuses[randomStatusIndex];

    const output: HumanVerificationOutput = {
      status,
    };

    log.info(`humanVerification output: ${output}`);
    return output;
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error humanVerification chat: ${error}`);
  }
};
