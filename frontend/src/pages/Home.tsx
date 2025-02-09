import React, { useEffect, useRef, useState } from "react";
import { useChat } from "@context/ChatProvider";
import Message from "@components/Message";
import Chat from "@components/Chat";

type Bot = {
  name: string;
  model: string;
  context: string;
};

type Props = {};

function Home({ }: Props) {
  const { chat } = useChat();
  const [scrolling, setScrolling] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [bots, setBots] = useState<Bot[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Auto-scroll to the bottom when new text arrives
    if (!scrolling) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrolling]);

  useEffect(() => {
    async function getBots(tries = 0) {
      if (tries == 10) {
        console.log("Unable to fetch bots");
        return;
      }
      setLoading(true);
      const response = await fetch("/chat/bots");
      if (!response.ok) {
        console.log("Unable to fetch bots");
        setTimeout(() => getBots(tries + 1), 100);
        return;
      }
      setLoading(false);
      const data = await response.json();
      setBots(data);
    }
    getBots();
  }, []);

  if (loading)
    return (
      <div className="w-full bg-base-200 h-full">
        <div className="loading loading-spinner"></div>
      </div>
    );

  return (
    <div className="w-full bg-base-200 h-full">
      <div className="flex">
        {bots.map((bot) => {
          return (
            <Chat
              bot_name={bot.name + " " + bot.model}
              context={bot.context}
              history={chat.history[bot.name]}
              currentQueue={chat.queue[bot.name]}
              key={bot.name}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Home;
