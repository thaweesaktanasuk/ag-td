import { step } from "@restackio/ai/workflow";
import * as functions from "../functions";

interface Input {
  name: string;
}

export async function multistepWorkflow({ name }: Input) {
  const userContent = `Greet this person: ${name}.`;

  // Step 1 get weather data from external API
  const weatherData = await step<typeof functions>({}).weather();

  // Step 1 create greeting message with openai

  const openaiOutput = await step<typeof functions>({}).llm({
    systemContent: `You are a personal assitant and have access to weather data ${weatherData}. Always greet person with relevant info from weather data`,
    userContent,
  });

  return {
    message: openaiOutput,
    weatherData,
  };
}
