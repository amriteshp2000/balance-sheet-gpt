// src/components/chat/ChatInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatInput = ({ onSend, disabled, placeholder }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-dark-900 border-t border-dark-200 dark:border-dark-700">
      <div className="flex items-end gap-3">
        {/* Attachment Button */}
        <button
          type="button"
          className="p-2.5 rounded-xl text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input Container */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-finbot-500 focus:border-transparent text-dark-900 dark:text-dark-100 placeholder:text-dark-400 dark:placeholder:text-dark-500 disabled:opacity-50 transition-all"
          />
        </div>

        {/* Voice Button */}
        <button
          type="button"
          className="p-2.5 rounded-xl text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Send Button */}
        <motion.button
          type="submit"
          disabled={!message.trim() || disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-finbot-600 text-white rounded-xl hover:bg-finbot-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-finbot hover:shadow-finbot-lg transition-all"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
      
      {/* Helper Text */}
      <p className="mt-2 text-xs text-dark-400 text-center">
        Press Enter to send, Shift + Enter for new line
      </p>
    </form>
  );
};

export default ChatInput;