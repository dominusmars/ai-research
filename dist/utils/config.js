"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandModel = getRandModel;
exports.getRandPrompt = getRandPrompt;
exports.getRandContext = getRandContext;
const log_1 = __importDefault(require("./log"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const fs_1 = __importDefault(require("fs"));
const config = parseConfig();
function parseConfig() {
    if (!fs_1.default.existsSync("./config.json")) {
        throw new Error("config.json not found");
    }
    const config = JSON.parse(fs_1.default.readFileSync("./config.json", "utf8"));
    if (!config.OLLAMA_HOST) {
        throw new Error("OLLAMA_HOST is required in config.json");
    }
    if (!config.OLLAMA_API_KEY) {
        (0, log_1.default)("No api key set for Ollama", "warn");
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
        (0, log_1.default)("reset_job is not defined in config.json", "warn");
    }
    if (config.reset_job && !isValidCron(config.reset_job)) {
        throw new Error("reset_job is not a valid cron schedule");
    }
    return config;
}
function isValidCron(scheduleString) {
    try {
        const parts = scheduleString.split(" ");
        if (parts.length !== 5) {
            return false;
        }
        const testJob = node_schedule_1.default.scheduleJob(scheduleString, () => { });
        if (testJob) {
            testJob.cancel();
            return true;
        }
        return false;
    }
    catch (error) {
        return false;
    }
}
function getRandModel() {
    return config.models[Math.floor(Math.random() * config.models.length)];
}
function getRandPrompt() {
    return config.starting_prompts[Math.floor(Math.random() * config.starting_prompts.length)];
}
function getRandContext() {
    return config.system_context[Math.floor(Math.random() * config.system_context.length)];
}
exports.default = parseConfig();
