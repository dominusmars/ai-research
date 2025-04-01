import { ChatResponse } from "ollama";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,

} from "react";
import { useEffect } from "react";
export type ChatHistory = {
  content: string;
  created_at: Date;
};
type Chat = {
  queue: {
    [bot_name: string]: ChatResponse[];
  };
  history: {
    [bot_name: string]: ChatHistory[];
  };
};

interface ChatContextType {
  chat: Chat;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type botTag = {
  name: string;
};

type PlayfieldEventResponse = ChatResponse & botTag;

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chat, setChat] = useState<Chat>({
    queue: {},
    history: {},
  });

  useEffect(() => {
    const eventSource = new EventSource("/chat");

    const handleResponse = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as PlayfieldEventResponse;
      addMessage(data);
    }

    eventSource.addEventListener("response", handleResponse);

    const handleError = (event: MessageEvent) => {
      console.error("EventSource failed:", event);
    }
    eventSource.addEventListener("error", handleError);


    const handleReset = (event: MessageEvent) => {
      console.log("Resetting chat");
      window.location.reload();
    }
    eventSource.addEventListener("reset", handleReset);


    // terminating the connection on component unmount
    return () => {
      // Remove the event listeners to prevent memory leaks
      eventSource.removeEventListener("response", handleResponse);
      eventSource.removeEventListener("error", handleError);
      eventSource.removeEventListener("reset", handleReset);

      // Close the event source when the component unmounts
      eventSource.close();

    };
  }, []);

  useEffect(() => {
    const getHistory = async () => {
      const response = await fetch("/chat/history");
      if (!response.ok) {
        console.log("Unable to fetch chat history");
        return;
      }
      const data = await response.json();
      setChat((prev) => {
        return {
          ...prev,
          history: data,
        };
      });
    };

    getHistory();
  }, []);

  const addMessage = (message: PlayfieldEventResponse) => {
    if (message.done) {
      setChat((prev) => {
        if (!prev.queue[message.name]) {
          prev.queue[message.name] = [];
        }
        let m = prev.queue[message.name].reduce(
          (p, res) => p + res.message.content,
          "",
        );
        m += message.message.content;
        const newHistory = prev.history[message.name]
          ? [
            ...prev.history[message.name],
            { content: m, created_at: message.created_at },
          ]
          : [{ content: m, created_at: message.created_at }];
        if (newHistory.length > 20) {
          newHistory.shift();
        }

        return {
          queue: {
            ...prev.queue,
            [message.name]: [],
          },
          history: {
            ...prev.history,
            [message.name]: newHistory,
          },
        };
      });
      return;
    }
    setChat((prev) => {
      return {
        queue: {
          ...prev.queue,
          [message.name]: prev.queue[message.name]
            ? [...prev.queue[message.name], message]
            : [message],
        },
        history: {
          ...prev.history,
        },
      };
    });
  };

  return (
    <ChatContext.Provider value={{ chat }}>{children}</ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
