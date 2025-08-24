"use client";
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import { useState } from "react";

type SendFormProps = {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  messages: any[];
};

/**
 * Modal form for sending conversation as PDF via email
 * Sends all messages to /api/send-pdf endpoint for PDF generation and email delivery
 */
export function SendConversationForm({
  isModalOpen,
  setIsModalOpen,
  messages,
}: SendFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const formData = new FormData(e.currentTarget);

      const email = formData.get("email") as string;

      const res = await fetch("/api/send-pdf", {
        method: "POST",
        body: JSON.stringify({ messages, toEmail: email }),
      });

      const resData = await res.json();
      const { error } = resData;
      if (error) {
        toast.error("There was a problem sending your mail");
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error("There was a problem sending your mail");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      title={"Send Conversation"}
      onClose={() => setIsModalOpen(false)}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111518] focus:outline-0 focus:ring-0 border-none bg-[#f0f3f4] focus:border-none h-14 placeholder:text-[#637c88] p-4 text-base font-normal leading-normal"
              required
            />
          </label>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 max-w-[480px] justify-center">
            <button
              disabled={isLoading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#19a1e5] text-white text-sm font-bold leading-normal tracking-[0.015em] grow"
            >
              <span className="truncate">
                {isLoading ? "Sending..." : "Send"}
              </span>
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#f0f3f4] text-[#111518] text-sm font-bold leading-normal tracking-[0.015em] grow"
            >
              <span className="truncate">Cancel</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
