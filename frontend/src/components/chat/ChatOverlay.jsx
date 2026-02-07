// src/components/chat/ChatOverlay.jsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Minimize2, 
  Maximize2,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatOverlay = () => {
  const { 
    messages, 
    isOpen, 
    isTyping, 
    isLoading,
    toggleChat, 
    closeChat,
    sendMessage,
    clearMessages 
  } = useChatStore();
  const { user } = useAuthStore();
  
  const [isMaximized, setIsMaximized] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (message) => {
    if (!message.trim() || isLoading) return;
    
    try {
      await sendMessage(message, user?.role, user?.company);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const suggestedPrompts = [
    "What's our total revenue?",
    "Show me the balance sheet summary",
    "Compare Q1 vs Q2 performance",
    "What are our largest expenses?",
  ];

  return (
    <>
      {/* Chat Toggle Button - Fixed bottom right */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-finbot-500 to-finbot-700 rounded-full shadow-lg shadow-finbot-500/30 flex items-center justify-center text-white z-50 hover:shadow-xl transition-shadow"
          >
            <MessageSquare className="w-6 h-6" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {messages.length > 9 ? '9+' : messages.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel - Fixed bottom right */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-50 bg-white dark:bg-dark-900 rounded-2xl shadow-2xl border border-dark-200 dark:border-dark-700 flex flex-col overflow-hidden ${
              isMaximized 
                ? 'inset-4 md:inset-6 lg:inset-8' 
                : 'bottom-6 right-6 w-[95vw] sm:w-[400px] h-[70vh] sm:h-[600px] max-h-[calc(100vh-48px)]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 bg-gradient-to-r from-finbot-500 to-finbot-700 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">FinBot Assistant</h3>
                  <p className="text-xs text-finbot-100">
                    {isTyping ? 'Typing...' : 'Online'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={clearMessages}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors hidden sm:block"
                  title={isMaximized ? 'Minimize' : 'Maximize'}
                >
                  {isMaximized ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={closeChat}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-dark-50 dark:bg-dark-950">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-16 h-16 bg-finbot-100 dark:bg-finbot-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-finbot-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-dark-800 dark:text-dark-200 mb-2">
                    How can I help you today?
                  </h4>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">
                    Ask me anything about your financial data
                  </p>
                  
                  {/* Suggested Prompts */}
                  <div className="w-full space-y-2">
                    {suggestedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full p-3 text-left text-sm bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl hover:border-finbot-300 dark:hover:border-finbot-700 hover:bg-finbot-50 dark:hover:bg-finbot-900/20 transition-all group"
                      >
                        <span className="text-dark-700 dark:text-dark-300 group-hover:text-finbot-600 dark:group-hover:text-finbot-400">
                          {prompt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-8 h-8 bg-finbot-100 dark:bg-finbot-900/30 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-finbot-500" />
                      </div>
                      <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-finbot-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-finbot-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-finbot-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0">
              <ChatInput 
                onSend={handleSendMessage} 
                disabled={isLoading}
                placeholder="Ask about your financial data..."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatOverlay;