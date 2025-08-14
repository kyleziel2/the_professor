"use client";
import Image from "next/image";
import { Mail } from "lucide-react";
import Modal from "./Modal";
import { useState } from "react";

interface MessageProps {
  messages: any;
}

export const NavigationBar = ({ messages }: MessageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const sendMail = async () => {
    if (!email) {
      return setEmailError("email is required");
    }
    const res = await fetch("/api/send-pdf", {
      method: "POST",
      body: JSON.stringify({ messages, toEmail: email }),
    });

    const resData = await res.json();
    setIsModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white flex items-center justify-between border-b border-solid border-b-[#F1F3F4] px-4 md:px-10 py-3">
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title={"Send Conversation"}
          onClose={() => setIsModalOpen(false)}
        >
          <div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111518] focus:outline-0 focus:ring-0 border-none bg-[#f0f3f4] focus:border-none h-14 placeholder:text-[#637c88] p-4 text-base font-normal leading-normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onClick={() => setEmailError("")}
                />
              </label>
            </div>
            {emailError ? (
              <div className="px-4">
                <span className="text-red-500">{emailError}</span>
              </div>
            ) : null}
            <div className="flex justify-center">
              <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 max-w-[480px] justify-center">
                <button
                  onClick={sendMail}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#19a1e5] text-white text-sm font-bold leading-normal tracking-[0.015em] grow"
                >
                  <span className="truncate">Send</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#f0f3f4] text-[#111518] text-sm font-bold leading-normal tracking-[0.015em] grow"
                >
                  <span className="truncate">Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      <Image src="/logo.png" alt="company logo" width="80" height="20" />
      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#00B5E8] text-white text-sm font-bold leading-normal tracking-[0.015em]"
        >
          <Mail className="hidden md:block" />
          <span className="truncate md:ml-4">Send Conversation</span>
        </button>
      </div>
    </header>
  );
};
