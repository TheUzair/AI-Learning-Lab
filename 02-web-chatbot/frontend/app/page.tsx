"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
      title="Copy code snippet"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-400 font-medium">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

const STARTER_PROMPTS = [
  {
    icon: "⚡",
    title: "LPU vs GPU Architecture",
    prompt: "How does Groq's LPU architecture achieve such low latency compared to traditional GPUs?",
  },
  {
    icon: "🐍",
    title: "FastAPI Best Practices",
    prompt: "Show me a production-ready FastAPI endpoint with Pydantic validation, dependency injection, and error handling.",
  },
  {
    icon: "💡",
    title: "AI Portfolio Ideas",
    prompt: "Give me 3 innovative AI project ideas that stand out on a software engineering resume.",
  },
  {
    icon: "🧠",
    title: "Context & Memory",
    prompt: "How can I implement long-term conversational memory using sliding windows and vector databases?",
  },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Check backend server status & fetch conversation history on mount
  useEffect(() => {
    async function init() {
      try {
        const rootRes = await fetch(`${API_BASE_URL}/`, { method: "GET" });
        if (rootRes.ok) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
        }
      } catch {
        setServerStatus("offline");
      }

      try {
        const histRes = await fetch(`${API_BASE_URL}/history`, { method: "GET" });
        if (histRes.ok) {
          const data = await histRes.json();
          if (Array.isArray(data.history) && data.history.length > 0) {
            const formatted = data.history.map((m: { role: string; content: string }) => ({
              ...m,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }));
            setMessages(formatted);
          }
        }
      } catch {
        // Fallback silently if history endpoint not loaded yet
      }
    }
    init();
  }, [API_BASE_URL]);

  // Loading timer effect
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingTime((prev) => +(prev + 0.1).toFixed(1));
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Track scroll position to show "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-resize textarea
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async (customMessage?: string) => {
    const textToSend = (customMessage || inputValue).trim();
    if (!textToSend || isLoading) return;

    setErrorMessage(null);
    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setLoadingTime(0);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage: Message = {
        role: "assistant",
        content: data.response || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setServerStatus("online");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect to backend.";
      setErrorMessage(
        `${errorMsg} Please ensure FastAPI is running on ${API_BASE_URL}.`
      );
      setServerStatus("offline");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`${API_BASE_URL}/history`, { method: "DELETE" });
    } catch {
      // Local clear anyway
    }
    setMessages([]);
    setErrorMessage(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Render message with ReactMarkdown and code block highlighting
  const renderMessageContent = (content: string, isUser: boolean) => {
    if (isUser) {
      return <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">{content}</p>;
    }

    return (
      <div className="markdown-content text-zinc-100 text-sm leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            pre({ children }) {
              return <>{children}</>;
            },
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");
              const isBlock = Boolean(match) || codeString.includes("\n");

              if (isBlock) {
                const language = match ? match[1] : "code";
                return (
                  <div className="my-2.5 rounded-xl border border-zinc-700/80 bg-zinc-950/90 overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400">
                      <span className="font-mono text-zinc-300 font-medium lowercase">{language}</span>
                      <CopyCodeButton code={codeString} />
                    </div>
                    <pre className="p-3.5 text-xs sm:text-sm font-mono text-zinc-200 overflow-x-auto whitespace-pre">
                      <code>{children}</code>
                    </pre>
                  </div>
                );
              }

              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-zinc-800/90 text-indigo-300 font-mono text-xs border border-zinc-700/50"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            p({ children }) {
              return <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>;
            },
            h1({ children }) {
              return <h1 className="text-lg font-bold text-zinc-100 mt-4 mb-2 first:mt-0">{children}</h1>;
            },
            h2({ children }) {
              return <h2 className="text-base font-bold text-zinc-100 mt-3.5 mb-1.5 first:mt-0">{children}</h2>;
            },
            h3({ children }) {
              return <h3 className="text-sm font-semibold text-zinc-200 mt-3 mb-1 first:mt-0">{children}</h3>;
            },
            ul({ children }) {
              return <ul className="list-disc list-outside pl-4 mb-2.5 space-y-1 text-zinc-200">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal list-outside pl-4 mb-2.5 space-y-1 text-zinc-200">{children}</ol>;
            },
            li({ children }) {
              return <li className="leading-relaxed">{children}</li>;
            },
            blockquote({ children }) {
              return (
                <blockquote className="border-l-2 border-indigo-500 pl-3 py-1 italic text-zinc-300 my-2.5 bg-zinc-800/20 rounded-r">
                  {children}
                </blockquote>
              );
            },
            table({ children }) {
              return (
                <div className="overflow-x-auto my-3 border border-zinc-800 rounded-lg shadow-sm">
                  <table className="w-full text-left text-xs border-collapse divide-y divide-zinc-800">{children}</table>
                </div>
              );
            },
            thead({ children }) {
              return <thead className="bg-zinc-800/80 text-zinc-200">{children}</thead>;
            },
            th({ children }) {
              return <th className="p-2.5 font-semibold text-zinc-200">{children}</th>;
            },
            td({ children }) {
              return <td className="p-2.5 border-t border-zinc-800/60 text-zinc-300">{children}</td>;
            },
            a({ children, href, ...props }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors cursor-pointer"
                  {...props}
                >
                  {children}
                </a>
              );
            },
            strong({ children }) {
              return <strong className="font-semibold text-white">{children}</strong>;
            },
            hr() {
              return <hr className="my-3 border-zinc-800" />;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="flex-none h-16 border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-zinc-100 tracking-tight">Nova Assistant</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Groq LPU
              </span>
            </div>
            <p className="text-xs text-zinc-400">Ultra-fast conversational AI</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs bg-zinc-900 border border-zinc-800">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === "online"
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  : serverStatus === "checking"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]"
              }`}
            />
            <span className="text-zinc-400">
              {serverStatus === "online" ? "FastAPI Online" : serverStatus === "checking" ? "Connecting..." : "Backend Offline"}
            </span>
          </div>

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              id="clear-chat-btn"
              type="button"
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all cursor-pointer"
              title="Clear current conversation"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Chat Container */}
      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 relative"
      >
        {/* Empty state / Welcome Hero */}
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center text-center pt-8 pb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-4 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              Powered by Groq LPUs & FastAPI
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-zinc-200 to-zinc-400 mb-3">
              How can I assist you today?
            </h2>

            <p className="text-zinc-400 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
              Ask anything from coding questions and architecture design to brainstorming and problem solving.
            </p>

            {/* Quick Starters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
              {STARTER_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(item.prompt)}
                  className="group flex flex-col p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-indigo-500/40 transition-all duration-200 text-left cursor-pointer shadow-sm hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={index}
              className={`flex items-start gap-3.5 max-w-3xl mx-auto animate-message-in ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-none w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold shadow-md ${
                  isUser
                    ? "bg-linear-to-tr from-zinc-700 to-zinc-600 text-zinc-100 ring-1 ring-zinc-500/30"
                    : "bg-linear-to-tr from-indigo-600 to-violet-600 text-white ring-1 ring-indigo-400/30"
                }`}
              >
                {isUser ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative flex flex-col max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm shadow-md transition-all ${
                  isUser
                    ? "bg-linear-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-xs selection:bg-indigo-900"
                    : "bg-zinc-900/90 border border-zinc-800/90 text-zinc-100 rounded-tl-xs selection:bg-indigo-500/30"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className={`text-[11px] font-medium tracking-wide ${isUser ? "text-indigo-200" : "text-indigo-400"}`}>
                    {isUser ? "You" : "Nova AI"}
                  </span>
                  {msg.timestamp && (
                    <span className={`text-[10px] ${isUser ? "text-indigo-200/70" : "text-zinc-500"}`}>
                      {msg.timestamp}
                    </span>
                  )}
                </div>

                <div className="text-sm font-normal text-zinc-100">
                  {renderMessageContent(msg.content, isUser)}
                </div>

                {/* Assistant Message Actions */}
                {!isUser && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-zinc-800/60 text-xs text-zinc-400">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(msg.content, index)}
                      className="flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Loading State with pulsating animation & timer */}
        {isLoading && (
          <div className="flex items-start gap-3.5 max-w-3xl mx-auto animate-message-in">
            <div className="flex-none w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xs shadow-md glow-active">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>

            <div className="flex flex-col bg-zinc-900/90 border border-zinc-800/90 rounded-2xl rounded-tl-xs p-4 shadow-md max-w-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 typing-dot-1" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 typing-dot-2" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 typing-dot-3" />
                </div>
                <span className="text-xs text-zinc-400 font-medium">
                  Generating answer... ({loadingTime}s)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-message-in">
            <svg className="w-5 h-5 flex-none text-rose-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-rose-200">Connection Error</p>
              <p className="mt-0.5 text-rose-300/90">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 z-30 p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 shadow-xl border border-zinc-700 transition-all hover:scale-105 cursor-pointer"
          title="Scroll to bottom"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Bottom Input Area */}
      <footer className="flex-none p-4 sm:p-5 bg-linear-to-t from-zinc-950 via-zinc-950/95 to-transparent z-20">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end rounded-2xl bg-zinc-900/90 border border-zinc-800 focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-xl backdrop-blur-xl p-2">
            <textarea
              id="chat-input"
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... (Press Enter to send, Shift+Enter for new line)"
              disabled={isLoading}
              className="flex-1 max-h-44 bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 resize-none outline-none leading-relaxed disabled:opacity-50"
            />

            <div className="flex items-center gap-1.5 pl-2 pb-1">
              <button
                id="send-button"
                type="button"
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 cursor-pointer ${
                  inputValue.trim() && !isLoading
                    ? "bg-linear-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}
                title="Send message"
              >
                {isLoading ? (
                  <svg className="w-4 h-4 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-zinc-500">
            <span>Model: gpt-oss-120b on Groq LPU</span>
            <span>FastAPI Backend: 127.0.0.1:8000</span>
          </div>
        </div>
      </footer>
    </div>
  );
}