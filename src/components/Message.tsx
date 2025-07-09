import { Bot, User } from "lucide-react";

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

export const Message = ({ content, role, timestamp }: MessageProps) => {
  return (
    <div className="flex gap-3 p-4">
      <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
        {role === "user" ? (
          <User className="size-5" />
        ) : (
          <Bot className="size-5" />
        )}
      </div>
      <div className="flex flex-1 flex-col items-stretch gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[#121516] text-base font-bold">
              {role === "user" ? "User" : "Assistant"}
            </p>
            <p className="text-[#6A7981] text-sm font-normal">
              {formatDate(timestamp)}
            </p>
          </div>
          <p className="text-[#121516] text-base font-normal">{content}</p>
        </div>
      </div>
    </div>
  );
};
