// components/Modal.tsx
import { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ×
        </button>
        {title && (
          <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
