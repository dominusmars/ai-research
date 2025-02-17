"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playfield = void 0;
const bot_1 = __importDefault(require("./bot"));
const events_1 = require("events");
const random_name_1 = __importDefault(require("random-name"));
const config_1 = __importStar(require("./config"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const log_1 = __importDefault(require("./log"));
class Playfield {
    constructor() {
        this.bots = [];
        this.events = new events_1.EventEmitter();
        this.initialize();
    }
    initialize(sendInitEvent = true) {
        if (this.bots.length >= 1) {
            this.bots.forEach((bot) => {
                bot.delete();
            });
        }
        this.bots = [];
        for (let i = 0; i < config_1.default.bots; i++) {
            this.bots.push(new bot_1.default(random_name_1.default.first(), (0, config_1.getRandModel)(), (0, config_1.getRandContext)()));
        }
        for (let i = 0; i < this.bots.length; i++) {
            this.bots[i].waterfall.on("message", (data) => {
                this.events.emit("response", { ...data });
            });
            this.bots[i].waterfall.on("complete", (message) => {
                this.bots[(i + 1) % this.bots.length].getResponse(message);
            });
        }
        if (config_1.default.reset_job) {
            (0, log_1.default)(`Setting reset job to ${config_1.default.reset_job}`, "info");
            node_schedule_1.default.scheduleJob(config_1.default.reset_job, () => {
                this.reset();
            });
        }
        this.start();
        // This sends reset event to the client when the server is restarted
        if (sendInitEvent) {
            this.events.emit("reset", "init");
        }
    }
    reset() {
        (0, log_1.default)("Resetting bots", "info");
        for (let i = 0; i < this.bots.length; i++) {
            this.bots[i].delete();
        }
        this.bots = [];
        this.initialize(false);
        // This sends reset event when reset is issued
        this.events.emit("reset", "reset");
    }
    async start() {
        await this.bots[0].getResponse((0, config_1.getRandPrompt)());
    }
    getBotInfo() {
        return this.bots.map((bot) => bot.info());
    }
    getHistory() {
        let history = {};
        for (let i = 0; i < this.bots.length; i++) {
            history[this.bots[i].name] = this.bots[i].getHistory();
        }
        return history;
    }
    getMessages() {
        let messages = {};
        for (let i = 0; i < this.bots.length; i++) {
            messages[this.bots[i].name] = this.bots[i].getMessages();
        }
        return messages;
    }
    getAllMessages() {
        let messages = {};
        for (let i = 0; i < this.bots.length; i++) {
            messages[this.bots[i].name] = this.bots[i].getAllMessages();
        }
        return messages;
    }
}
exports.playfield = new Playfield();
