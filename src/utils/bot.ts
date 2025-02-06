import ollama, { ChatResponse, Ollama } from "ollama";
import events from "events";
const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";

class Bot {
  private client: Ollama;
  // might be a good idea to move this to a db instead of storing it in memory
  responses: ChatResponse[] = [];
  model: string;
  name: string;

  constructor(name: string, model: string) {
    this.client = new Ollama({ host: ollamaHost });
    this.model = model;
    this.name = name;
  }
  private log(message: string) {
    const m = `[${this.name}] [${new Date().toISOString()}] ${message}`.replace(
      /[\r\n]+/g,
      "",
    );
    console.log(m);
  }

  private createRequest(query: string) {
    return {
      model: this.model,
      messages: [{ role: "user", content: query }],
    };
  }
  public async getResponse(query: string) {
    const request = this.createRequest(query);
    const response = await this.client.chat(request);
    this.responses.push(response);
    this.log(response.message.content);
    return response;
  }
  public getResponses() {
    return this.responses;
  }
}

export default Bot;
