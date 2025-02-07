import ollama, { ChatRequest, ChatResponse, Ollama } from "ollama";
import { A } from "ollama/dist/shared/ollama.67ec3cf9";
import { EventEmitter } from "events";
import log from "./log";
const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";

type ChatHistory = {
  total_duration: number;
  created_at: Date;
  content: string;
};

interface BotEvents {
  message: [ChatResponse];
  complete: [string];
}

class Bot {
  private client: Ollama;
  // might be a good idea to move this to a db instead of storing it in memory
  model: string;
  name: string;
  current_message: string;
  messages: ChatHistory[];
  waterfall = new EventEmitter<BotEvents>();
  constructor(name: string, model: string) {
    this.client = new Ollama({ host: ollamaHost });
    this.model = model;
    this.name = name;
    this.current_message = "";
    this.messages = [];
  }

  private createRequest(query: string): ChatRequest {
    return {
      model: this.model,
      messages: [{ role: "user", content: query }],
    };
  }
  private removeThinking(message: string) {
    return message.replace(/<think>.*<\/think>/gm, "");
  }
  private saveChat(response: ChatResponse) {
    this.current_message += response.message.content;
    if (response.done) {
      const current_history: ChatHistory = {
        content: this.current_message,
        created_at: response.created_at,
        total_duration: response.total_duration,
      };
      this.messages.push(current_history);
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
      this.waterfall.emit("message", data);
    }
  }
  public getHistory() {
    return this.messages;
  }

  public async getResponse(query: string) {
    const request = this.createRequest(query);
    const response = this.client.chat({ ...request, stream: true });
    this.processRequest(response);
    return response;
  }
}

export default Bot;
