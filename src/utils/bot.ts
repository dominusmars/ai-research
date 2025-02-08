import ollama, { ChatRequest, ChatResponse, Ollama } from "ollama";
import { A } from "ollama/dist/shared/ollama.67ec3cf9";
import { EventEmitter } from "events";
import log from "./log";
import db from "./db";
const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";

export type ChatHistory = {
  total_duration: number;
  created_at: number;
  content: string;
  role: "user" | "assistant";
};
type botTag = {
  name: string;
};
export type BotResponse = ChatResponse & botTag;

interface BotEvents {
  message: [BotResponse];
  complete: [string];
}

class Bot {
  private client: Ollama;
  // might be a good idea to move this to a db instead of storing it in memory
  model: string;
  name: string;
  current_message: string;
  // messages: ChatHistory[];
  waterfall = new EventEmitter<BotEvents>();
  constructor(name: string, model: string) {
    this.client = new Ollama({ host: ollamaHost });

    this.model = model;
    this.name = name;
    this.current_message = "";
    // this.messages = [];
  }

  private createRequest(query: string): ChatRequest {
    db.addMessage(this.name, {
      content: this.removeThinking(query),
      created_at: new Date().getTime(),
      total_duration: 0,
      role: "user",
    });
    const messages = db.getMessages(this.name);
    return {
      model: this.model,
      messages: messages,
    };
  }
  private removeThinking(message: string) {
    return message.replace(/<think>.*<\/think>/gms, "");
  }
  private saveChat(response: ChatResponse) {
    this.current_message += response.message.content;
    if (response.done) {
      const current_history: ChatHistory = {
        content: this.current_message,
        created_at:
          response.created_at instanceof Date
            ? response.created_at.getTime()
            : new Date(response.created_at).getTime(),
        total_duration: response.total_duration,
        role: "assistant",
      };
      db.addMessage(this.name, current_history);
      // this.messages.push(current_history);
      log(`[${this.name}] ${this.current_message}`);
      this.waterfall.emit("complete", this.current_message);
      this.current_message = "";
      return;
    }
  }
  private async processRequest(response: Promise<A<ChatResponse>>) {
    const res = await response;
    for await (const data of res) {
      this.saveChat(data);
      this.waterfall.emit("message", { ...data, name: this.name });
    }
  }
  public getHistory() {
    return db.getBotMessages(this.name);
  }
  public getMessages() {
    return db.getMessages(this.name);
  }

  public async getResponse(query: string) {
    const request = this.createRequest(query);
    const response = this.client.chat({ ...request, stream: true });
    this.processRequest(response);
    return response;
  }
  public info() {
    return {
      name: this.name,
      model: this.model,
    };
  }
}

export default Bot;
