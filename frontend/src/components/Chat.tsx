import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChatResponse } from "ollama";
import { ChatHistory } from "@context/ChatProvider";
import Message from "@components/Message";
type Props = {
  bot_name: string;
  history?: ChatHistory[];
  currentQueue?: ChatResponse[];
};

export default function Chat({ bot_name, history, currentQueue }: Props) {
  const [scrolling, setScrolling] = useState(false);
  const [page, setPage] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to the bottom when new text arrives
    if (!scrolling) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentQueue, scrolling]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const memoizedMessages = React.useMemo(() => {
    return (
      <>
        {history &&
          history.map((m, i) => (
            <Message message={m.content} created_at={m.created_at} key={i} />
          ))}
        {currentQueue && currentQueue[0] && (
          <Message
            message={currentQueue.reduce(
              (prev, m) => prev + m.message.content,
              "",
            )}
            created_at={currentQueue[0].created_at}
            pending={true}
          />
        )}
      </>
    );
  }, [history, currentQueue]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] shadow p-4 bg-base-300 relative">
      <h2 className="text-lg p-4 font-bold">{bot_name.toUpperCase()}</h2>
      <div
        className="flex flex-col gap-2 overflow-y-scroll max-h-[calc(100vh-10rem)] scrollbar-hide overflow-x-hidden"
        ref={containerRef}
      >
        {memoizedMessages}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
