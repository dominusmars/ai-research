import Bot from "./bot";

export const botOne = new Bot("bot_one", "deepseek-r1:1.5b");
export const botTwo = new Bot("bot_two", "deepseek-r1:1.5b");

let contiuneChatting = true;

async function startChatting(currentResponse: string) {
  const response = await botOne.getResponse(currentResponse);
  const response_bot_two = await botTwo.getResponse(response.message.content);
  if (!contiuneChatting) {
    return;
  }
  setTimeout(() => startChatting(response_bot_two.message.content), 1);
}
startChatting(process.env.QUERY || "Hows your day?");
