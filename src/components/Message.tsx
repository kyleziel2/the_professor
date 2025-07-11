import { Bot, User, GraduationCap } from "lucide-react";

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
    <div
      className={`flex items-end gap-3 p-4 ${
        role === "user" ? "flex-row-reverse text-right" : "text-left"
      }`}
    >
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full ${
          role === "assistant"
            ? "text-[#111518] bg-[#f0f3f4]"
            : "text-white bg-[#00B5E8]"
        }`}
      >
        {role === "user" ? (
          <User className="size-5" />
        ) : (
          <GraduationCap className="size-5" />
        )}
      </div>

      <div className="flex flex-col gap-1 max-w-[80%]">
        <p className="text-[#637c88] text-sm font-normal">
          {role === "user" ? "User" : "Professor"}
        </p>
        <p
          className={`inline-block w-fit break-words rounded-xl px-4 py-3 text-base font-normal ${
            role === "assistant"
              ? "text-[#111518] bg-[#f0f3f4]"
              : "text-white bg-[#00B5E8]"
          }`}
        >
          {content}
        </p>
      </div>
    </div>
  );
};
