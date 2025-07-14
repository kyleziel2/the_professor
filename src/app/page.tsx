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
    "Hi, I'm new to this. Where do I start?",
    "I learned about SBNRR last week but I'm struggling to use it when my boss criticizes me in front of others",
    "I just walked out of a meeting where I completely lost it. Screamed at my team. I might get fired. What do I do?",
  ];

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

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
      <div className="sm:px-12 md:px-20 lg:px-64">
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
        <div className="fixed bottom-0 left-0 w-full bg-white px-4 py-3 border-t border-gray-200">
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
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // prevent newline
                    handleSubmit(e); // your submit function
                    setMessage(""); // clear input
                    if (inputRef.current) {
                      inputRef.current.style.height = "auto"; // reset height
                    }
                  }
                }}
                rows={1}
                placeholder="Ask me anything..."
                className="w-full resize-none overflow-hidden bg-transparent border-none text-base text-[#121516] placeholder:text-[#6a7981] focus:outline-none leading-[1.6] pr-10"
              />

              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#00B5E8] flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>
      {messages.length !== 0 && <div className="h-120"></div>}
    </div>
  );
};

export default HomePage;
