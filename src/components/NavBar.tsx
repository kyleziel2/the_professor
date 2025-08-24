"use client";
import Image from "next/image";
import { FileText, Mail } from "lucide-react";
import { useState } from "react";
import { SendConversationForm } from "./SendConversationForm";
import { SendSummaryForm } from "./SendSummaryForm";

interface MessageProps {
  messages: any;
  threadId: string;
}

/**
 * Sticky navigation bar with logo and email export buttons
 * Manages modal states for sending conversation PDFs and AI-generated summaries
 */
export const NavigationBar = ({ messages, threadId }: MessageProps) => {
  // Modal visibility state for the two email features
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white flex items-center justify-between border-b border-solid border-b-[#F1F3F4] px-4 md:px-10 py-3">
      {isConversationModalOpen && (
        <SendConversationForm
          isModalOpen={isConversationModalOpen}
          setIsModalOpen={setIsConversationModalOpen}
          messages={messages}
        />
      )}
      {isSummaryModalOpen && (
        <SendSummaryForm
          isModalOpen={isSummaryModalOpen}
          setIsModalOpen={setIsSummaryModalOpen}
          threadId={threadId}
        />
      )}
      <Image src="/logo.png" alt="company logo" width="80" height="20" />
      <div className="flex items-center">
        {/* AI Summary Email Button - generates and emails conversation summary */}
        <button
          onClick={() => setIsSummaryModalOpen(true)}
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full px-4 py-2 bg-white text-[#00B5E8] text-xs md:text-sm font-bold border-2 border-[#00B5E8] leading-normal tracking-[0.015em]"
        >
          <FileText className="hidden md:block" size={20} />
          <span className="truncate md:ml-4">Send Summary</span>
        </button>
        
        {/* PDF Conversation Export Button - emails full chat as PDF */}
        <button
          onClick={() => setIsConversationModalOpen(true)}
          className="ml-4 flex cursor-pointer items-center justify-center overflow-hidden rounded-full px-4 py-2 bg-[#00B5E8] text-white text-xs md:text-sm font-bold border-2 border-[#00B5E8] leading-normal tracking-[0.015em]"
        >
          <Mail className="hidden md:block" size={20} />
          <span className="truncate md:ml-4">Send Conversation</span>
        </button>
      </div>
    </header>
  );
};
