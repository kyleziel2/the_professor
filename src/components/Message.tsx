import { User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

interface MessageProps {
  content: string;
  role: string;
  timestamp: Date;
}

const formatDate = (date: Date) => {
  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return timeString;
};

function removeBrackets(text: string) {
  return text.replace(/【.*?】/g, "");
}

function removeFileExtensions(text: string) {
  return text.replace(/\b\w+\.\w{2,4}\b/g, "");
}

export const Message = ({ content, role, timestamp }: MessageProps) => {
  return (
    <div
      className={`flex items-end md:gap-2 gap-1 p-2 ${
        role === "user" ? "flex-row-reverse text-right" : "text-left"
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-full ${
          role === "assistant"
            ? "w-12 h-12"
            : "text-white bg-[#00B5E8] w-10 h-10"
        }`}
      >
        {role === "user" ? (
          <User className="size-5" />
        ) : (
          <Image
            src="/professor.jpeg"
            alt="Assistant avatar"
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-1 max-w-[80%]">
        <p className="text-[#637c88] text-sm font-normal">
          {role === "user" ? "User" : "Professor"}
        </p>
        <div
          className={`text-left inline-block w-fit break-words rounded-xl px-4 py-3 text-base font-normal ${
            role === "assistant"
              ? "text-[#111518] bg-[#f0f3f4]"
              : "text-white bg-[#00B5E8]"
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => (
                <p
                  style={{
                    marginBottom: role === "assistant" ? "1.4rem" : "0",
                  }}
                  {...props}
                />
              ),
            }}
          >
            {removeFileExtensions(removeBrackets(content))}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
