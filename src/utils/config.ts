import log from "./log";
import schedule from "node-schedule";
import fs from "fs";
type Config = {
  OLLAMA_HOST: string;
  OLLAMA_API_KEY: string;
  models: string[];
  system_context: string[];
  bots: number;
  starting_prompts: string[];
  reset_job: string;
};
const config = parseConfig();
function parseConfig(): Config {
  if (!fs.existsSync("./config.json")) {
    throw new Error("config.json not found");
  }
  const config = JSON.parse(fs.readFileSync("./config.json", "utf8")) as Config;

  if (!config.OLLAMA_HOST) {
    throw new Error("OLLAMA_HOST is required in config.json");
  }
  if (!config.OLLAMA_API_KEY) {
    log("No api key set for Ollama", "warn");
  }
  if (!config.models) {
    throw new Error("models is required in config.json");
  }
  if (!config.system_context) {
    throw new Error("system_context is required in config.json");
  }
  if (!config.bots) {
    throw new Error("bots is required in config.json");
  }
  if (!config.starting_prompts) {
    throw new Error("starting_prompts is required in config.json");
  }

  if (!config.reset_job) {
    log("reset_job is not defined in config.json", "warn");
  }
  if (config.reset_job && !isValidCron(config.reset_job)) {
    throw new Error("reset_job is not a valid cron schedule");
  }

  return config;
}
function isValidCron(scheduleString: string) {
  try {
    const parts = scheduleString.split(" ");

    if (parts.length !== 5) {
      return false;
    }

    const testJob = schedule.scheduleJob(scheduleString, () => {});
    if (testJob) {
      testJob.cancel();
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}
function getRandModel(): string {
  return config.models[Math.floor(Math.random() * config.models.length)];
}
function getRandPrompt(): string {
  return config.starting_prompts[
    Math.floor(Math.random() * config.starting_prompts.length)
  ];
}
function getRandContext(): string {
  return config.system_context[
    Math.floor(Math.random() * config.system_context.length)
  ];
}
export { getRandModel, getRandPrompt, getRandContext };

export default parseConfig();
