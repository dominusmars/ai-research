"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ollama_1 = require("ollama");
const events_1 = require("events");
const log_1 = __importDefault(require("./log"));
const db_1 = __importDefault(require("./db"));
const config_1 = __importDefault(require("./config"));
class Bot {
    constructor(name, model, systemContext) {
        // messages: ChatHistory[];
        this.waterfall = new events_1.EventEmitter();
        this.client = new ollama_1.Ollama({ host: config_1.default.OLLAMA_HOST });
        this.model = model;
        this.name = name;
        this.current_message = "";
        this.systemContext = systemContext;
    }
    createRequest(query) {
        db_1.default.addMessage(this.name, {
            content: this.removeThinking(query),
            created_at: new Date().getTime(),
            total_duration: 0,
            role: "user",
        });
        const messages = db_1.default.getMessages(this.name);
        return {
            model: this.model,
            messages: this.systemContext
                ? [
                    {
                        content: this.systemContext,
                        role: "system",
                    },
                    ...messages,
                ]
                : messages,
        };
    }
    removeThinking(message) {
        return message.replace(/<think>.*<\/think>/gms, "");
    }
    saveChat(response) {
        this.current_message += response.message.content;
        if (response.done) {
            const current_history = {
                content: this.current_message,
                created_at: response.created_at instanceof Date
                    ? response.created_at.getTime()
                    : new Date(response.created_at).getTime(),
                total_duration: response.total_duration,
                role: "assistant",
            };
            db_1.default.addMessage(this.name, current_history);
            // this.messages.push(current_history);
            (0, log_1.default)(`[${this.name}] ${this.current_message}`);
            this.waterfall.emit("complete", this.current_message);
            this.current_message = "";
            return;
        }
    }
    async processRequest(response) {
        const res = await response;
        for await (const data of res) {
            this.saveChat(data);
            this.waterfall.emit("message", { ...data, name: this.name });
        }
    }
    getHistory() {
        return db_1.default.getBotMessages(this.name);
    }
    getMessages() {
        return db_1.default.getMessages(this.name);
    }
    getAllMessages() {
        return db_1.default.getAllMessages(this.name);
    }
    async getResponse(query) {
        const request = this.createRequest(query);
        const response = this.client.chat({ ...request, stream: true });
        // usually happens when theres no longer a conncetion to the server
        response.catch((err) => {
            (0, log_1.default)(err, "error");
            if (this.current_message.length > 0) {
                // if there is a current message, we need to save it, and act as if the conversation is done
                const endResponse = {
                    model: this.model,
                    done_reason: "No connection to the server",
                    load_duration: 0,
                    prompt_eval_count: 0,
                    prompt_eval_duration: 0,
                    eval_count: 0,
                    done: true,
                    created_at: new Date(),
                    total_duration: 0,
                    message: {
                        content: "",
                        role: "assistant",
                    },
                    eval_duration: 0,
                };
                this.saveChat(endResponse);
            }
        });
        this.processRequest(response);
        return response;
    }
    info() {
        return {
            name: this.name,
            model: this.model,
            context: this.systemContext,
        };
    }
    delete() {
        this.waterfall.removeAllListeners();
        db_1.default.removeMessages(this.name);
    }
}
exports.default = Bot;
