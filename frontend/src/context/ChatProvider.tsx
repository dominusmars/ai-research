import { ChatResponse } from "ollama";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useEffect } from "react";
type ChatHistory = {
  message: string;
  created_at: Date;
};

interface ChatContextType {
  history: { [bot_name: string]: ChatHistory[] };
  currentQueue: { [bot_name: string]: ChatResponse[] };
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type botTag = {
  name: string;
};

type PlayfieldEventResponse = ChatResponse & botTag;

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [history, setHistory] = useState<{
    [bot_name: string]: ChatHistory[];
  }>({});

  const [currentQueue, setCurrentQueue] = useState<{
    [bot_name: string]: ChatResponse[];
  }>({});

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3000/chat");
    eventSource.addEventListener("response", (event: MessageEvent) => {
      const data = JSON.parse(event.data) as PlayfieldEventResponse;
      addMessage(data);
    });

    // terminating the connection on component unmount
    return () => eventSource.close();
  }, []);

  const addMessage = (message: PlayfieldEventResponse) => {
    console.log(message.done);
    if (message.done) {
      if (!currentQueue[message.name]) {
        currentQueue[message.name] = [];
      }
      currentQueue[message.name] = [...currentQueue[message.name], message];
      const m = currentQueue[message.name].reduce(
        (prev, m) => prev + m.message.content,
        "",
      );
      console.log("message done: " + m);
      setHistory((prev) => {
        const new_history = { ...prev };
        if (!new_history[message.name]) {
          new_history[message.name] = [];
        }
        new_history[message.name] = [
          ...new_history[message.name],
          {
            message: m,
            created_at: message.created_at,
          },
        ];
        return new_history;
      });
      setCurrentQueue((prev) => {
        const new_queue = { ...prev };
        new_queue[message.name] = [];
        return new_queue;
      });
      return;
    }
    setCurrentQueue((prev) => {
      const new_queue = { ...prev };
      if (!new_queue[message.name]) {
        new_queue[message.name] = [];
      }
      new_queue[message.name] = [...new_queue[message.name], message];

      return new_queue;
    });
  };

  return (
    <ChatContext.Provider value={{ currentQueue, history }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
