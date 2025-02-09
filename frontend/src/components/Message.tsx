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
import { format } from "date-fns";
import ErrorBoundary from "@context/ErrorBoundaries";
type MessageProps = {
  message: string;
  created_at: Date;
  pending?: boolean;
  done?: boolean;
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
      <div>Created at: {format(new Date(created_at), "PPPppp")}</div>
      <ErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
          rehypePlugins={[
            rehypeKatex as any,
            rehypeMathjax,
            rehypeRaw,
            rehypeHighlight,
          ]}
          skipHtml

        >
          {message + (showCursor ? "█" : "")}
        </ReactMarkdown>
      </ErrorBoundary>
    </div>
  );
};

export default Message;
