// src/components/layout/Sidebar.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  TrendingUp,
  LayoutDashboard,
  FileSpreadsheet,
  Upload,
  MessageSquare,
  Settings,
  HelpCircle,
  X,
  ChevronRight
} from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';

const Sidebar = ({ isOpen, onClose }) => {
  const { openChat } = useChatStore();
  const { user } = useAuthStore();

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileSpreadsheet, label: 'Documents', path: '/documents' },
    { icon: Upload, label: 'Upload', path: '/upload', roles: ['analyst'] },
  ];

  const bottomNavItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
  ];

  const filteredNavItems = mainNavItems.filter(
    item => !item.roles || item.roles.includes(user?.role)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-800">
      {/* Logo */}
      <div className="p-6 border-b border-dark-200 dark:border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-finbot-500 to-finbot-700 rounded-xl flex items-center justify-center shadow-finbot">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">FinBot</h1>
            <p className="text-xs text-dark-500 dark:text-dark-400">Financial AI</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-finbot-50 dark:bg-finbot-900/30 text-finbot-600 dark:text-finbot-400'
                  : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}

        {/* Chat Button */}
        <button
          onClick={openChat}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 w-full group"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Chat with FinBot</span>
          <span className="ml-auto px-2 py-0.5 bg-finbot-100 dark:bg-finbot-900/50 text-finbot-600 dark:text-finbot-400 text-xs font-semibold rounded-full">
            AI
          </span>
        </button>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-dark-200 dark:border-dark-800 space-y-2">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Pro Badge */}
      <div className="p-4">
        <div className="p-4 bg-gradient-to-br from-finbot-500 to-finbot-700 rounded-2xl text-white">
          <h3 className="font-semibold mb-1">Upgrade to Pro</h3>
          <p className="text-sm text-finbot-100 mb-3">
            Get advanced analytics and unlimited uploads
          </p>
          <button className="w-full py-2 bg-white text-finbot-600 rounded-xl font-medium text-sm hover:bg-finbot-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed position */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Slide in overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Sidebar Panel */}
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 shadow-2xl"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors z-10"
              >
                <X className="w-5 h-5 text-dark-600 dark:text-dark-300" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;