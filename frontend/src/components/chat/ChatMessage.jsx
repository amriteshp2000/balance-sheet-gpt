// src/components/chat/ChatMessage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

const ChatMessage = ({ message }) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.type === 'user';
  const isError = message.type === 'error';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-finbot-600'
            : isError
            ? 'bg-loss/20'
            : 'bg-finbot-100 dark:bg-finbot-900/30'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 text-loss" />
        ) : (
          <Sparkles className="w-4 h-4 text-finbot-500" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative group ${
            isUser
              ? 'chat-bubble-user'
              : isError
              ? 'bg-loss/10 text-loss rounded-2xl rounded-bl-md px-4 py-3'
              : 'chat-bubble-bot'
          }`}
        >
          {/* Markdown Content for Bot Messages */}
          {!isUser && !isError ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                  code: ({ inline, children }) =>
                    inline ? (
                      <code className="px-1.5 py-0.5 bg-dark-200 dark:bg-dark-700 rounded text-sm font-mono">
                        {children}
                      </code>
                    ) : (
                      <pre className="p-3 bg-dark-200 dark:bg-dark-700 rounded-lg overflow-x-auto my-2">
                        <code className="text-sm font-mono">{children}</code>
                      </pre>
                    ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                      <table className="min-w-full border border-dark-200 dark:border-dark-700 rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-2 bg-dark-100 dark:bg-dark-800 text-left text-xs font-semibold border-b border-dark-200 dark:border-dark-700">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 text-sm border-b border-dark-200 dark:border-dark-700">
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Copy Button (for bot messages) */}
          {!isUser && !isError && (
            <button
              onClick={handleCopy}
              className="absolute -right-10 top-1 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-profit" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-dark-500" />
              )}
            </button>
          )}
        </div>

        {/* Timestamp & Context Indicator */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-dark-400 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
          {message.contextUsed && (
            <span className="px-1.5 py-0.5 bg-finbot-100 dark:bg-finbot-900/30 text-finbot-600 dark:text-finbot-400 rounded">
              Used context
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;