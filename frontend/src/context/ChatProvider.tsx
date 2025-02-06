import { ChatResponse } from 'ollama';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useEffect } from 'react';
import io from 'socket.io-client';
interface ChatContextType {
    messages: string[];
    addMessage: (message: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);
type botTag = {
    "name": string;
}
type PlayfieldEventResponse = ChatResponse & botTag;



export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<string[]>([]);



    useEffect(() => {
        const eventSource = new EventSource("http://localhost:3000/chat");

        eventSource.addEventListener("response", (event: MessageEvent) => {
            const data = JSON.parse(event.data) as PlayfieldEventResponse;
            addMessage(data.message.content);
        });

        // terminating the connection on component unmount
        return () => eventSource.close();

    }, []);


    const addMessage = (message: string) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    return (
        <ChatContext.Provider value={{ messages, addMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};