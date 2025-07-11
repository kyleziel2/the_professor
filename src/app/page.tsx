"use client";
import { NavigationBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Message } from "@/components/Message";
import { useEffect, useRef, useState } from "react";
import { TypingIndicator } from "@/components/TypingLoader";
import { Send } from "lucide-react";

type Message = {
  content: string;
  role: string;
  timestamp: Date;
};

const HomePage = () => {
  const suggestedQuestions: string[] = [
    "What’s on your mind today?",
    "How’s work been lately?",
    "Need support with something emotional at work?",
  ];

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: any) => {
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
      body: JSON.stringify({ message: userMessage }),
    });
    const data = await res.json();
    const reply = data.reply;

    clearTimeout(typingTimeout);
    setIsTyping(false);

    setMessages((prev) => [
      ...prev,
      { content: reply, role: "assistant", timestamp: new Date() },
    ]);
  };

  const getLastUserMessageIndex = () => {
    return messages
      .map((m, i) => ({ role: m.role, i }))
      .filter((m) => m.role === "user")
      .at(-1)?.i;
  };

  return (
    <div>
      <NavigationBar messages={messages} />
      <div className="sm:px-12 md:px-20 lg:px-56">
        <div className="text-center py-8">
          <h1 className="text-[#121516] text-[1.5rem] md:text-[2rem] font-bold pb-3 pt-5 px-2">
            AI Professor – Your Workplace
            <span className="text-[#00B5E8]"> EQ Guide</span>
          </h1>
          <h5>Ask questions, get support, grow professionally</h5>
        </div>
        <div>
          <h5 className="text-[#121516] text-lg font-semibold px-4 pb-2 pt-4">
            Suggested Questions
          </h5>
          <div className="flex gap-3 p-3 flex-wrap pr-4">
            {suggestedQuestions.map((question, index) => (
              <div
                key={index}
                onClick={() => {
                  setMessage(question);
                  inputRef.current?.focus();
                }}
                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#F1F3F4] pl-4 pr-4 cursor-pointer"
              >
                <p className="text=[#121516] text-sm font-medium">{question}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          {messages.map((message, index) => {
            return (
              <div
                key={index}
                ref={
                  index === getLastUserMessageIndex() ? bottomRef : undefined
                }
              >
                <Message
                  content={message.content}
                  role={message.role}
                  timestamp={message.timestamp}
                />
              </div>
            );
          })}
          {isTyping && <TypingIndicator />}
        </div>
        <div className="px-4 py-3 fixed bottom-0 w-full left-0 bg-white">
          <form
            className="sm:px-12  md:px-20 lg:px-56 py-4"
            onSubmit={handleSubmit}
          >
            <label className="flex flex-col min-w-40 h-12 w-full">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-full relative">
                <input
                  ref={inputRef}
                  placeholder="Ask me anything..."
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121516] focus:outline-0 focus:ring-0 border-none bg-[#F1F3F4] focus:border-none h-full placeholder:text-[#6a7981] px-4 pr-10 text-base font-normal leading-normal"
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                />

                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#00B5E8] flex items-center justify-center"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </label>
          </form>
        </div>
      </div>
      {messages.length !== 0 && <div className="h-120"></div>}
    </div>
  );
};

export default HomePage;
