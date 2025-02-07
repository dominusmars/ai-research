import React, { useEffect, useState } from "react";
import { JSX } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css"; // For math rendering
import "highlight.js/styles/github-dark.css";


type MessageProps = {
  message: string;
  created_at: Date;
  pending?: boolean;
};

const Message: React.FC<MessageProps> = ({ message, created_at, pending }) => {
  const [showCursor, setShowCursor] = useState(pending);
  useEffect(() => {
    if (!pending) return;
    const interval = setInterval(() => {
      setShowCursor((prevShowCursor) => !prevShowCursor);
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="p-2 rounded-lg bg-gray-800 text-white mb-2">
      <div>Created at: {created_at.toString()}</div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeKatex as any, rehypeMathjax, rehypeRaw, rehypeHighlight]}
      >
        {message + (showCursor ? "█" : "")}
      </ReactMarkdown>
      {/* <pre className="text-wrap"> {} </pre> */}
    </div>
  );
};

export default Message;
