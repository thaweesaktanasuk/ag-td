import { defineEvent } from "@restackio/ai/agent";

export type EndEvent = {
  end: boolean;
};

export const endEvent = defineEvent<boolean>("end");
