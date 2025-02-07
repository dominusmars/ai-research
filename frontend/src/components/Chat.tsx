import React, { useEffect, useRef, useState } from 'react'
import { ChatResponse } from 'ollama'
import { ChatHistory } from '../context/ChatProvider';
import Message from './Message';
type Props = {
    bot_name: string;
    history?: ChatHistory[];
    currentQueue: ChatResponse[];
}

export default function Chat({ bot_name, history, currentQueue }: Props) {
    const [scrolling, setScrolling] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        // Auto-scroll to the bottom when new text arrives
        if (!scrolling) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentQueue, scrolling]);

    return (
        <div
            className="w-full h-[calc(100vh-4rem)] shadow p-4 bg-base-300 relative"
        >
            <h2 className="text-lg p-4 font-bold">{bot_name.toUpperCase()}</h2>
            <div className='flex flex-col gap-2 overflow-y-scroll max-h-[calc(100vh-8rem)] scrollbar-hide overflow-x-hidden'>
                {history &&
                    history.map((m, i) => (
                        <Message message={m.message} created_at={m.created_at} key={i} />
                    ))}
                {currentQueue[0] && (
                    <Message
                        message={currentQueue.reduce(
                            (prev, m) => prev + m.message.content,
                            "",
                        )}
                        created_at={currentQueue[0].created_at}
                        pending={true}
                    />
                )}
                <div ref={bottomRef} />
            </div>

        </div>
    )
}