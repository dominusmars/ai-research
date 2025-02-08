import { ChatResponse } from "ollama";
import Bot, { BotResponse, ChatHistory } from "./bot";
import { EventEmitter } from "events";
import random from "random-name";
interface PlayfieldEvents {
  response: [BotResponse];
  error: [Error];
}

// TO-DO: take from config
const models = ["deepseek-r1:1.5b", "llama3.2:1b"];

class Playfield {
  currentMessage: string;
  bots: Bot[];
  events = new EventEmitter<PlayfieldEvents>();
  constructor(amountofBots = 2) {
    this.currentMessage = process.env.QUERY || "How are you?";
    this.bots = [];
    for (let i = 0; i < amountofBots; i++) {
      this.bots.push(
        new Bot(
          random.first(),
          models[Math.floor(Math.random() * models.length)],
        ),
      );
    }

    for (let i = 0; i < this.bots.length; i++) {
      this.bots[i].waterfall.on("message", (data) => {
        this.events.emit("response", { ...data });
      });
      this.bots[i].waterfall.on("complete", (message) => {
        this.bots[(i + 1) % this.bots.length].getResponse(message);
      });
    }
    // this.botOne = new Bot("bot_one", "deepseek-r1:1.5b");
    // this.botTwo = new Bot("bot_two", "deepseek-r1:1.5b");

    // this.botOne.waterfall.on("message", (data) => {
    //   this.events.emit("response", { ...data });
    // });
    // this.botTwo.waterfall.on("message", (data) => {
    //   this.events.emit("response", { ...data });
    // });
    // this.botOne.waterfall.on("complete", (message) => {
    //   this.botTwo.getResponse(message);
    // });
    // this.botTwo.waterfall.on("complete", (message) => {
    //   this.botOne.getResponse(message);
    // });
    this.start();
  }
  async start() {
    await this.bots[0].getResponse(process.env.QUERY || "How are you?");
  }
  getBotInfo() {
    return this.bots.map((bot) => bot.info());
  }
  getHistory() {
    let history: {
      [bot_name: string]: ChatHistory[];
    } = {};
    for (let i = 0; i < this.bots.length; i++) {
      history[this.bots[i].name] = this.bots[i].getHistory() as ChatHistory[];
    }
    return history;
  }
  getMessages() {
    let messages: {
      [bot_name: string]: ChatHistory[];
    } = {};
    for (let i = 0; i < this.bots.length; i++) {
      messages[this.bots[i].name] = this.bots[i].getMessages() as ChatHistory[];
    }
    return messages;
  }
}

export const playfield = new Playfield();
