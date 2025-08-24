"use client";
import { Send, Paperclip, Mic } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { PuffLoader } from "react-spinners";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isTyping: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxRows?: number;
}

/**
 * Modern chat input component with auto-resize, keyboard shortcuts, and loading states
 * Features: auto-height adjustment, Enter/Shift+Enter handling, attachment button, mic button
 */
export const ChatInput = ({
  message,
  setMessage,
  onSubmit,
  isTyping,
  placeholder = "Message AI Professor...",
  disabled = false,
  maxRows = 5,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);

  // Auto-resize textarea based on content
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset to minimum height first
    textarea.style.height = "48px";

    // Only adjust if content exceeds minimum height
    if (textarea.scrollHeight > 48) {
      const maxHeight = 48 + 24 * (maxRows - 1); // 48px base + 24px per additional row
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;

      // Update rows for visual consistency
      const newRows = Math.min(Math.ceil(newHeight / 24), maxRows);
      setRows(newRows);
    } else {
      setRows(1);
    }
  };

  // Use useLayoutEffect for synchronous DOM updates
  useEffect(() => {
    adjustHeight();
  }, [message, maxRows]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping || disabled) return;
    onSubmit(e);

    // Reset textarea height after submit
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        setRows(1);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Trigger height adjustment after state update
    requestAnimationFrame(() => adjustHeight());
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4">
      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="relative">
          {/* Main input container */}
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isTyping}
              rows={rows}
              className="w-full resize-none bg-transparent px-4 py-3 pr-24 text-gray-900 placeholder-gray-500 border-none outline-none focus:ring-0 text-base leading-6 overflow-hidden"
              style={{
                minHeight: "48px",
                height: "48px", // Set initial height
                lineHeight: "24px", // Explicit line height for consistency
              }}
            />

            {/* Right side buttons container */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-2">
              {/* Attachment button */}
              <button
                type="button"
                disabled={isTyping}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150 disabled:opacity-50"
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>

              {/* Voice input button */}
              <button
                type="button"
                disabled={isTyping}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150 disabled:opacity-50"
                title="Voice input"
              >
                <Mic size={18} />
              </button>

              {/* Submit/Stop button */}
              <button
                type="submit"
                disabled={(!message.trim() && !isTyping) || disabled}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isTyping
                    ? "bg-[#00B5E8] hover:bg-[#00B5E8] text-white"
                    : message.trim()
                      ? "bg-[#00B5E8] hover:bg-[#00B5E8] text-white shadow-sm hover:shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                title={isTyping ? "Stop generation" : "Send message"}
              >
                {isTyping ? (
                  <PuffLoader color="#FFF" size={18} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Footer text */}
          <div className="text-center mt-2">
            <p className="text-xs text-gray-400">
              Press{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">
                Enter
              </kbd>{" "}
              to send,
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs ml-1">
                Shift + Enter
              </kbd>{" "}
              for new line
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
