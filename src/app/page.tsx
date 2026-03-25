"use client";
import { NavigationBar } from "@/components/NavBar";
import { Message } from "@/components/Message";
import { useEffect, useRef, useState } from "react";
import { TypingIndicator } from "@/components/TypingLoader";
import { ChatInput } from "@/components/ChatInput";

type Message = {
  content: string;
  role: string;
  timestamp: Date;
};

/**
 * Main chat interface component
 * Handles streaming conversations with OpenAI Responses API
 * Features: auto-scroll, typing indicators, responsive design
 *
 * KEY CHANGE: No more threadId — full message history is sent with each request.
 */
const HomePage = () => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handle message submission with streaming response.
   * Sends the FULL conversation history to the API (no threadId needed).
   */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setIsTyping(true);

    // Add user message + empty assistant placeholder for streaming
    const newMessages: Message[] = [
      ...messages,
      { content: userMessage, role: "user", timestamp: new Date() },
      { content: "", role: "assistant", timestamp: new Date() },
    ];
    setMessages(newMessages);

    // Build the message history for the API (excluding the empty placeholder)
    // Only send role and content — timestamps are frontend-only
    const apiMessages = newMessages
      .filter((m) => m.content.trim() !== "")
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    // Send full conversation history to the streaming API endpoint
    const res = await fetch("/api/assistant", {
      method: "POST",
      body: JSON.stringify({ messages: apiMessages }),
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
      <NavigationBar messages={messages} />
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
      </div>
      {messages.length !== 0 && <div className="h-120"></div>}
    </div>
  );
};

export default HomePage;
