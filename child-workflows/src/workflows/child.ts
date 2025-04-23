import zodToJsonSchema from "zod-to-json-schema";
import { z } from "zod";
import { log, step } from "@restackio/ai/workflow";
import * as functions from "../functions";

interface Input {
  name: string;
}
const GoodbyeMessageSchema = z.object({
  message: z.string().describe("The goodbye message."),
});

const goodbyeJsonSchema = {
  name: "goodbye",
  schema: zodToJsonSchema(GoodbyeMessageSchema),
};

export async function childWorkflow({ name }: Input) {
  // Step 1: Create hello message with simple function
  const { message: greetMessage } = await step<typeof functions>({}).hello({
    name,
  });

  log.info("Hello", { greetMessage });

  return {
    messages: { greetMessage },
  };
}
