import config from "../../config.json";

type Config = {
    OLLAMA_HOST: string;
    models: string[];
    system_context: string[];
    bots: number;
    starting_prompts: string[];
};

function parseConfig(): Config {
    if (!config.OLLAMA_HOST) {
        throw new Error("OLLAMA_HOST is required in config.json");
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
    return config;
}
function getRandModel(): string {
    return config.models[Math.floor(Math.random() * config.models.length)];
}
function getRandPrompt(): string {
    return config.starting_prompts[Math.floor(Math.random() * config.starting_prompts.length)];
}
function getRandContext(): string {
    return config.system_context[Math.floor(Math.random() * config.system_context.length)];
}
export { getRandModel, getRandPrompt, getRandContext };

export default parseConfig();
