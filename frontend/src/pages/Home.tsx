import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatProvider";
import Message from "../components/Message";
import Chat from "../components/Chat";

type Props = {};

function Home({ }: Props) {
  const { history, currentQueue } = useChat();
  const [scrolling, setScrolling] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Auto-scroll to the bottom when new text arrives
    if (!scrolling) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentQueue, scrolling]);

  return (
    <div className="w-full bg-base-200 h-full">
      <div className="flex">
        {Object.keys(currentQueue).map((key) => {
          return (
            <Chat bot_name={key} history={history[key]} currentQueue={currentQueue[key]} key={key} />
          );
        })}
      </div>
    </div>
  );
}

export default Home;
