import { FunctionFailure, log } from "@restackio/ai/function";

export const weather = async (): Promise<string> => {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m";

  try {
    const response = await fetch(url);
    log.info("response", { response });

    if (response.ok) {
      const data = await response.json();
      log.info("weather data", { data });
      return JSON.stringify(data);
    } else {
      log.error(`Error: ${response.status}`);
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    log.error(`Error: ${error}`);
    throw FunctionFailure.nonRetryable(`Error fetching weather data: ${error}`);
  }
};
