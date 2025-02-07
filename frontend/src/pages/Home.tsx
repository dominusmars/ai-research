import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatProvider";
import Message from "../components/Message";

type Props = {};

function Home({}: Props) {
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
    <div className="w-full bg-base-200">
      <div className="flex flex-col justify-center items-center h-full">
        <div className="flex text-wrap max-w-screen">
          {Object.keys(currentQueue).map((key) => {
            return (
              <div
                className={`h-screen shadow p-4 bg-base-300 overflow-scroll relative`}
              >
                <h2 className="text-lg p-4 sticky">{key.toUpperCase()}</h2>
                {Object.keys(history).includes(key) &&
                  history[key].map((m) => (
                    <Message message={m.message} created_at={m.created_at} />
                  ))}
                {currentQueue[key][0] && (
                  <Message
                    message={currentQueue[key].reduce(
                      (prev, m) => prev + m.message.content,
                      "",
                    )}
                    created_at={currentQueue[key][0].created_at}
                    pending={true}
                  />
                )}
                <div ref={bottomRef} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
