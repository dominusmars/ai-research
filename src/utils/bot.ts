import ollama, { ChatRequest, ChatResponse, Ollama } from "ollama";
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
 
  private createRequest(query: string): ChatRequest {
    return {
      model: this.model,
      messages: [{ role: "user", content: query }],
    };
  }
  public async getResponse(query: string) {
    const request = this.createRequest(query);
    const response = this.client.chat( {...request, stream: true});
    return response;
  }
  
}

export default Bot;
