// src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Upload, 
  Database, 
  TrendingUp,
  RefreshCw,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Search,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { useChatStore } from '../../stores/chatStore';
import StatsCard from './StatsCard';
import DataTable from './DataTable';
import FileUpload from './FileUpload';
import DataAssignmentModal from './DataAssignmentModal';
import toast from 'react-hot-toast';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const { 
    tables, 
    uploadedFiles, 
    isLoading, 
    fetchDashboardData, 
    error,
    lastFetch 
  } = useDataStore();
  const { addWelcomeMessage, openChat } = useChatStore();
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Auto-load dashboard data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      if (user?.role) {
        try {
          await fetchDashboardData(user.role, user.company);
          console.log('✅ Dashboard data loaded');
        } catch (err) {
          console.error('❌ Failed to load dashboard:', err);
          toast.error('Failed to load dashboard data');
        }
      }
    };
    
    loadDashboard();
    
    // Add welcome message to chat
    if (user?.name) {
      addWelcomeMessage(user.name);
    }
  }, [user, fetchDashboardData, addWelcomeMessage]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData(user.role, user.company);
      toast.success('Data refreshed successfully!');
    } catch (err) {
      toast.error('Failed to refresh data');
    }
    setRefreshing(false);
  }, [user, fetchDashboardData]);

  // Assignment handlers
  const handleAssignClick = (file) => {
    setSelectedFile(file);
    setShowAssignModal(true);
  };

  const handleAssignClose = () => {
    setShowAssignModal(false);
    setSelectedFile(null);
  };

  // Calculate stats
  const stats = [
    {
      title: 'Total Documents',
      value: uploadedFiles.length + tables.length,
      icon: FileSpreadsheet,
      trend: '+12%',
      trendUp: true,
      color: 'finbot',
      description: 'All uploaded documents'
    },
    {
      title: 'Data Tables',
      value: tables.filter(t => t.headers?.length > 0).length,
      icon: Database,
      trend: '+8%',
      trendUp: true,
      color: 'profit',
      description: 'Parsed financial tables'
    },
    {
      title: 'Recent Uploads',
      value: uploadedFiles.length,
      icon: Upload,
      trend: 'Today',
      trendUp: true,
      color: 'purple',
      description: 'Files uploaded this session'
    },
    {
      title: 'Your Role',
      value: user?.role?.toUpperCase() || 'N/A',
      icon: Users,
      subtitle: user?.company || 'All Companies',
      color: 'amber',
      description: 'Access level'
    },
  ];

  // Quick action cards for different roles
  const quickActions = [
    {
      title: 'Ask FinBot',
      description: 'Get AI-powered insights about your data',
      icon: Activity,
      color: 'finbot',
      onClick: openChat
    },
    {
      title: 'Export Report',
      description: 'Download financial summary as PDF',
      icon: Download,
      color: 'profit',
      onClick: () => toast.info('Export feature coming soon!')
    },
    {
      title: 'View Analytics',
      description: 'Detailed charts and visualizations',
      icon: BarChart3,
      color: 'purple',
      onClick: () => setActiveTab('analytics')
    },
  ];

  // Filter tables based on search
  const filteredTables = tables.filter((table) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    
    // Search in headers
    if (table.headers?.some(h => String(h).toLowerCase().includes(searchLower))) {
      return true;
    }
    
    // Search in chunk text
    if (table.chunk_text?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in rows
    if (table.rows?.some(row => 
      row.some(cell => String(cell).toLowerCase().includes(searchLower))
    )) {
      return true;
    }
    
    return false;
  });

  // Render loading state
  if (isLoading && tables.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-finbot-200 dark:border-finbot-800 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-finbot-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-dark-700 dark:text-dark-300">
              Loading your dashboard...
            </p>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
              Fetching financial data for {user?.role}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render error state
  if (error && tables.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-loss/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-loss" />
          </div>
          <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
            Failed to Load Data
          </h3>
          <p className="text-dark-500 dark:text-dark-400 mb-6">
            {error}
          </p>
          <button onClick={handleRefresh} className="btn-primary">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {lastFetch 
              ? `Last updated: ${new Date(lastFetch).toLocaleTimeString()}`
              : "Here's your financial data overview"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search data..."
              className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-finbot-500 transition-all"
            />
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {/* View Toggle */}
          <div className="hidden md:flex items-center bg-dark-100 dark:bg-dark-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-dark-700 shadow-sm'
                  : 'hover:bg-dark-200 dark:hover:bg-dark-700'
              }`}
            >
              <PieChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-dark-700 shadow-sm'
                  : 'hover:bg-dark-200 dark:hover:bg-dark-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions - Only for certain roles */}
      {(user?.role === 'analyst' || user?.role === 'cfo' || user?.role === 'ceo') && (
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                onClick={action.onClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="card-hover p-5 text-left group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  action.color === 'finbot' 
                    ? 'bg-finbot-100 dark:bg-finbot-900/30 text-finbot-600 group-hover:bg-finbot-200 dark:group-hover:bg-finbot-800/50'
                    : action.color === 'profit'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 group-hover:bg-green-200'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 group-hover:bg-purple-200'
                }`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-dark-900 dark:text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  {action.description}
                </p>
                <div className="mt-3 flex items-center text-finbot-600 dark:text-finbot-400 text-sm font-medium">
                  Get started
                  <ArrowUpRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Upload Section - Only for Analysts */}
        {user?.role === 'analyst' && (
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <FileUpload onAssign={handleAssignClick} />
          </motion.div>
        )}

        {/* Data Tables Section */}
        <motion.div 
          variants={itemVariants}
          className={user?.role === 'analyst' ? 'lg:col-span-2' : 'lg:col-span-3'}
        >
          <div className="card">
            {/* Tables Header */}
            <div className="p-6 border-b border-dark-100 dark:border-dark-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-finbot-500" />
                    Financial Data
                  </h2>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                    {filteredTables.length} of {tables.length} table{tables.length !== 1 ? 's' : ''} 
                    {searchQuery && ` matching "${searchQuery}"`}
                  </p>
                </div>

                {/* Mobile Search */}
                <div className="relative md:hidden">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-sm"
                  />
                </div>

                {/* Filter & Export */}
                <div className="flex items-center gap-2">
                  <button className="btn-ghost text-sm">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="btn-ghost text-sm">
                    <Download className="w-4 h-4" />
                    Export All
                  </button>
                </div>
              </div>
            </div>

            {/* Tables Content */}
            <div className="p-6">
              {filteredTables.length === 0 ? (
                <EmptyState 
                  searchQuery={searchQuery}
                  userRole={user?.role}
                  onClearSearch={() => setSearchQuery('')}
                />
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {filteredTables.map((table, index) => (
                    <DataTable 
                      key={index} 
                      data={table} 
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Section */}
      {uploadedFiles.length > 0 && user?.role === 'analyst' && (
        <motion.div variants={itemVariants}>
          <RecentActivity 
            files={uploadedFiles} 
            onAssign={handleAssignClick}
          />
        </motion.div>
      )}

      {/* Assignment Modal */}
      <AnimatePresence>
        {showAssignModal && selectedFile && (
          <DataAssignmentModal
            file={selectedFile}
            onClose={handleAssignClose}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ searchQuery, userRole, onClearSearch }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 bg-dark-100 dark:bg-dark-800 rounded-2xl flex items-center justify-center mb-6">
      <Database className="w-10 h-10 text-dark-400" />
    </div>
    
    {searchQuery ? (
      <>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
          No Results Found
        </h3>
        <p className="text-dark-500 dark:text-dark-400 mb-6 max-w-md">
          No tables match your search for "{searchQuery}". Try a different search term.
        </p>
        <button onClick={onClearSearch} className="btn-secondary">
          Clear Search
        </button>
      </>
    ) : (
      <>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
          No Data Available
        </h3>
        <p className="text-dark-500 dark:text-dark-400 mb-6 max-w-md">
          {userRole === 'analyst' 
            ? 'Upload a PDF document to get started with financial analysis.'
            : 'No data has been assigned to your role yet. Contact your analyst for access.'}
        </p>
        {userRole === 'analyst' && (
          <div className="flex items-center gap-3">
            <button className="btn-primary">
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        )}
      </>
    )}
  </div>
);

// Recent Activity Component
const RecentActivity = ({ files, onAssign }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2">
        <Clock className="w-5 h-5 text-finbot-500" />
        Recent Activity
      </h2>
      <button className="text-sm text-finbot-600 dark:text-finbot-400 hover:underline">
        View All
      </button>
    </div>

    <div className="space-y-3">
      {files.slice(0, 5).map((file, index) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-4 p-4 bg-dark-50 dark:bg-dark-800 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors group"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            file.status === 'success'
              ? 'bg-profit/10 text-profit'
              : 'bg-loss/10 text-loss'
          }`}>
            {file.status === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-dark-900 dark:text-white truncate">
              {file.name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-dark-500 dark:text-dark-400">
                {file.wordCount} words
              </span>
              {file.assignedTo && (
                <span className="text-xs px-2 py-0.5 bg-finbot-100 dark:bg-finbot-900/30 text-finbot-600 dark:text-finbot-400 rounded-full">
                  → {file.assignedTo.role}
                </span>
              )}
              <span className="text-xs text-dark-400">
                {new Date(file.uploadedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onAssign(file)}
              className="p-2 rounded-lg hover:bg-dark-200 dark:hover:bg-dark-600 text-dark-500 hover:text-finbot-600"
              title="Assign to role"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-dark-200 dark:hover:bg-dark-600 text-dark-500 hover:text-dark-700"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-dark-200 dark:hover:bg-dark-600 text-dark-500 hover:text-dark-700"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default Dashboard;