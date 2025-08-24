"use client";
import { NavigationBar } from "@/components/NavBar";
import { Message } from "@/components/Message";
import { useEffect, useRef, useState } from "react";
import { TypingIndicator } from "@/components/TypingLoader";
import { Send } from "lucide-react";
import { PuffLoader } from "react-spinners";
import { ChatInput } from "@/components/ChatInput";

type Message = {
  content: string;
  role: string;
  timestamp: Date;
};

/**
 * Main chat interface component
 * Handles streaming conversations with OpenAI Assistant
 * Features: auto-scroll, typing indicators, responsive design
 */
const HomePage = () => {
  // Refs for auto-scrolling and textarea height management
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Core chat state
  const [threadId, setThreadId] = useState(""); // OpenAI conversation thread
  const [message, setMessage] = useState(""); // Current input text
  const [messages, setMessages] = useState<Message[]>([]); // Chat history
  const [isTyping, setIsTyping] = useState(false); // Loading state

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /*const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;
    const userMessage = message;
    setMessages((prev) => [
      ...prev,
      { content: message.trim(), role: "user", timestamp: new Date() },
    ]);
    setMessage("");

    const typingTimeout = setTimeout(() => setIsTyping(true), 1000);
    const res = await fetch("/api/assistant", {
      method: "POST",
      body: JSON.stringify({ message: userMessage, threadId }),
    });
    const data = await res.json();
    const reply = data.reply;
    setThreadId(data.threadId);

    clearTimeout(typingTimeout);
    setIsTyping(false);

    setMessages((prev) => [
      ...prev,
      { content: reply, role: "assistant", timestamp: new Date() },
    ]);
  };*/

  /**
   * Handle message submission with streaming response
   * Creates placeholder assistant message that gets updated in real-time
   */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setIsTyping(true);

    // Add user message + empty assistant placeholder for streaming
    const newMessages = [
      ...messages,
      { content: userMessage, role: "user", timestamp: new Date() },
      { content: "", role: "assistant", timestamp: new Date() },
    ];
    setMessages(newMessages);

    // Send message to streaming API endpoint
    const res = await fetch("/api/assistant", {
      method: "POST",
      body: JSON.stringify({ message: userMessage, threadId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    let fullReply = "";
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    // Process streaming response chunks
    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        // Extract thread ID from special header chunk
        if (chunk.startsWith("__THREAD_ID__:")) {
          const currentThread = chunk.replace("__THREAD_ID__:", "").trim();
          setThreadId(currentThread);
          continue;
        }

        // Accumulate response text and update UI incrementally
        fullReply += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex]?.role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: fullReply,
            };
          }
          return updated;
        });
      }
    }

    setIsTyping(false);
  };

  // Helper to find the most recent user message for scroll targeting
  const getLastUserMessageIndex = () => {
    return messages
      .map((m, i) => ({ role: m.role, i }))
      .filter((m) => m.role === "user")
      .at(-1)?.i;
  };

  return (
    <div>
      <NavigationBar messages={messages} threadId={threadId} />
      <div className="sm:px-12 md:px-20 lg:px-64">
        <div className="text-center py-8">
          <h1 className="text-[#121516] text-[1.5rem] md:text-[2rem] font-bold pb-3 pt-5 px-2">
            AI Professor – Your Workplace
            <span className="text-[#00B5E8]"> EQ Guide</span>
          </h1>
          <h5>Ask questions, get support, grow professionally</h5>
        </div>
        <div>
          {messages.map((message, index) => {
            return (
              <div
                key={index}
                ref={
                  index === getLastUserMessageIndex() ? bottomRef : undefined
                }
                className={
                  index === getLastUserMessageIndex() ? `scroll-mt-24` : ``
                }
              >
                {message.content && (
                  <Message
                    content={message.content}
                    role={message.role}
                    timestamp={message.timestamp}
                  />
                )}
              </div>
            );
          })}
          {isTyping && <TypingIndicator />}
        </div>
        <ChatInput
          message={message}
          setMessage={setMessage}
          onSubmit={handleSubmit}
          isTyping={isTyping}
          placeholder="Ask me anything..."
          disabled={false}
          maxRows={5}
        />
        {/*<div className="fixed bottom-0 left-0 w-full bg-white px-4 py-3 border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
              if (inputRef.current) {
                inputRef.current.style.height = "auto";
              }
            }}
            className="sm:px-12 md:px-20 lg:px-64 py-4"
          >
            <div className="flex items-center rounded-xl bg-[#F1F3F4] px-3 py-2 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  // Auto-resize textarea based on content
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }}
                onKeyDown={(e) => {
                  // Submit on Enter (but allow Shift+Enter for new lines)
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                    setMessage("");
                    if (inputRef.current) {
                      inputRef.current.style.height = "auto"; // Reset height after submit
                    }
                  }
                }}
                rows={1}
                placeholder="Ask me anything..."
                className="w-full resize-none overflow-hidden bg-transparent border-none text-base text-[#121516] placeholder:text-[#6a7981] focus:outline-none leading-[1.6] pr-10"
              />

              <button
                type="submit"
                disabled={isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#00B5E8] flex items-center justify-center cursor-pointer"
              >
                {/* Show loading spinner during AI response, send icon otherwise */}
        {/*isTyping ? (
                  <PuffLoader color="#FFF" size={20} />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </form>
        </div>*/}
      </div>
      {messages.length !== 0 && <div className="h-120"></div>}
    </div>
  );
};

export default HomePage;
