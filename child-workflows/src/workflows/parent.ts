import { childStart, childExecute } from "@restackio/ai/workflow";
import { childWorkflow } from "./child";

interface Input {
  name: string;
}
export async function parentWorkflow({ name }: Input) {
  const startedChild = await childStart({
    child: childWorkflow,
    childId: "startChild-workflow",
    input: { name },
  });

  const executedChild = await childExecute({
    child: childWorkflow,
    childId: "executeChild-workflow",
    input: { name },
  });

  return {
    messages: { startedChild, executedChild },
  };
}
