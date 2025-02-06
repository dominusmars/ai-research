import { ChatResponse } from "ollama";
import Bot from "./bot";
import { EventEmitter } from "events";

type botTag = {
  "name":string;
}
type PlayfieldEventResponse = ChatResponse & botTag;

interface PlayfieldEvents {
  "response": [PlayfieldEventResponse];
  "error": [Error];
}

class Playfield {
  currentMessage: string;
  botOne: Bot;
  botTwo: Bot;
  events = new EventEmitter<PlayfieldEvents>();
  constructor() {
    this.currentMessage = process.env.QUERY || "How are you?";
    this.botOne = new Bot("bot_one", "deepseek-r1:1.5b");
    this.botTwo = new Bot("bot_two", "deepseek-r1:latest");
    this.start();
  
  }
  restart(){
    this.currentMessage = process.env.QUERY || "How are you?";
    
  }
  async start(){
    let res = await this.botOne.getResponse(this.currentMessage);
    this.currentMessage = "";
    for await (const data of res) {
      this.events.emit("response", {...data, name: "bot_one"});
    }
    res = await this.botTwo.getResponse(this.currentMessage);
    this.currentMessage = "";
    for await (const data of res) {
      this.events.emit("response", {...data, name: "bot_two"});
    } 

    setTimeout(() => {
      this.start();
    }
    , 1);

  } 

}

export const playfield = new Playfield();
