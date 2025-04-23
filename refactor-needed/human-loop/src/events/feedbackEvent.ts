import { defineEvent } from "@restackio/ai/agent";

export type FeedbackEvent = {
  feedback: string;
};

export const feedbackEvent = defineEvent<string>("feedback");
