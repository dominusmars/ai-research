import { ChatResponse } from "ollama";
import Bot from "./bot";
import { EventEmitter } from "events";

type botTag = {
  name: string;
};
type PlayfieldEventResponse = ChatResponse & botTag;

interface PlayfieldEvents {
  response: [PlayfieldEventResponse];
  error: [Error];
}

class Playfield {
  currentMessage: string;
  botOne: Bot;
  botTwo: Bot;
  events = new EventEmitter<PlayfieldEvents>();
  constructor() {
    this.currentMessage = process.env.QUERY || "How are you?";
    this.botOne = new Bot("bot_one", "deepseek-r1:1.5b");
    this.botTwo = new Bot("bot_two", "deepseek-r1:1.5b");
    this.botOne.waterfall.on("message", (data) => {
      this.events.emit("response", { ...data, name: "bot_one" });
    });
    this.botTwo.waterfall.on("message", (data) => {
      this.events.emit("response", { ...data, name: "bot_two" });
    });
    this.botOne.waterfall.on("complete", (message) => {
      this.botTwo.getResponse(message);
    });
    this.botTwo.waterfall.on("complete", (message) => {
      this.botOne.getResponse(message);
    });
    this.start();
  }
  async start() {
    await this.botOne.getResponse(process.env.QUERY || "How are you?");
  }
}

export const playfield = new Playfield();
