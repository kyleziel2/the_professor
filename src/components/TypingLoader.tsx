export const TypingIndicator = () => {
  return (
    <div className="inline-flex items-center bg-gray-200 inline gap-1 px-3 py-2 rounded-full">
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
  );
};
