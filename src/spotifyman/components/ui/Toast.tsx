import React from 'react';

interface ToastProps {
  message: string | null;
  isError?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isError }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] max-w-[90vw] md:max-w-md px-5 py-3 rounded-xl bg-[#222222]/95 backdrop-blur-md border border-[#333333] shadow-2xl text-sm font-medium text-white flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
        isError ? 'border-l-4 border-l-[#ff5c5c]' : 'border-l-4 border-l-[#1db954]'
      }`}
    >
      <span>{message}</span>
    </div>
  );
};
