import { ChatResponse } from "ollama";
import Bot, { BotResponse, ChatHistory } from "./bot";
import { EventEmitter } from "events";
import random from "random-name";
import config, { getRandModel, getRandContext, getRandPrompt } from "./config";
import schedule from "node-schedule";
import log from "./log";

interface PlayfieldEvents {
  response: [BotResponse];
  error: [Error];
  reset: [string];
}

class Playfield {
  bots: Bot[] = [];
  events = new EventEmitter<PlayfieldEvents>();
  constructor() {
    this.initialize();
  }
  initialize(sendInitEvent = true) {
    if (this.bots.length >= 1) {
      this.bots.forEach((bot) => {
        bot.delete();
      });
    }
    this.bots = [];
    for (let i = 0; i < config.bots; i++) {
      this.bots.push(new Bot(random.first(), getRandModel(), getRandContext()));
    }
    for (let i = 0; i < this.bots.length; i++) {
      this.bots[i].waterfall.on("message", (data) => {
        this.events.emit("response", { ...data });
      });
      this.bots[i].waterfall.on("complete", (message) => {
        this.bots[(i + 1) % this.bots.length].getResponse(message);
      });
    }

    if (config.reset_job) {
      log(`Setting reset job to ${config.reset_job}`, "info");
      schedule.scheduleJob(config.reset_job, () => {
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
    log("Resetting bots", "info");
    for (let i = 0; i < this.bots.length; i++) {
      this.bots[i].delete();
    }
    this.bots = [];
    this.initialize(false);
    // This sends reset event when reset is issued
    this.events.emit("reset", "reset");
  }

  async start() {
    await this.bots[0].getResponse(getRandPrompt());
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
  getAllMessages() {
    let messages: {
      [bot_name: string]: ChatHistory[];
    } = {};
    for (let i = 0; i < this.bots.length; i++) {
      messages[this.bots[i].name] = this.bots[
        i
      ].getAllMessages() as ChatHistory[];
    }
    return messages;
  }
}

export const playfield = new Playfield();
