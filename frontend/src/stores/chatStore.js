// src/stores/chatStore.js
import { create } from 'zustand';
import { chatAPI } from '../services/api';

export const useChatStore = create((set, get) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  isTyping: false,
  error: null,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  
  openChat: () => set({ isOpen: true }),
  
  closeChat: () => set({ isOpen: false }),

  sendMessage: async (query, role, company) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      isTyping: true,
      error: null,
    }));

    try {
      const response = await chatAPI.sendMessage(query, role, company);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.answer,
        contextUsed: response.context_used,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, botMessage],
        isLoading: false,
        isTyping: false,
      }));

      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to get response';
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: errorMsg,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
        isTyping: false,
        error: errorMsg,
      }));

      throw error;
    }
  },

  clearMessages: () => set({ messages: [], error: null }),

  addWelcomeMessage: (userName) => {
    const welcomeMessage = {
      id: 'welcome',
      type: 'bot',
      content: `Hello ${userName}! 👋 I'm FinBot, your AI financial assistant. I can help you analyze balance sheets, understand financial data, and answer questions about your company's finances. How can I assist you today?`,
      timestamp: new Date().toISOString(),
    };
    
    set((state) => {
      if (state.messages.some(m => m.id === 'welcome')) {
        return state;
      }
      return { messages: [welcomeMessage, ...state.messages] };
    });
  },
}));