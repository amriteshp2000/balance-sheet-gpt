// src/components/layout/Layout.jsx
import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children, darkMode, toggleTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      {/* Sidebar - Fixed on left */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area - Offset by sidebar width on desktop */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Navbar - Sticky at top */}
        <Navbar 
          darkMode={darkMode} 
          toggleTheme={toggleTheme}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        {/* Page Content */}
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;