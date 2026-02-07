// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/dashboard/StatsCard';
import DataTable from '../components/dashboard/DataTable';
import FileUpload from '../components/dashboard/FileUpload';
import DataAssignmentModal from '../components/dashboard/DataAssignmentModal';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { useChatStore } from '../stores/chatStore';
import { 
  FileSpreadsheet, 
  Upload, 
  Database, 
  TrendingUp,
  RefreshCw,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = ({ darkMode, toggleTheme }) => {
  const { user } = useAuthStore();
  const { 
    tables, 
    uploadedFiles, 
    isLoading, 
    fetchDashboardData, 
    error 
  } = useDataStore();
  const { addWelcomeMessage } = useChatStore();
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-load dashboard data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      if (user?.role && !tables.length) {
        try {
          await fetchDashboardData(user.role, user.company);
          toast.success('Dashboard data loaded!');
        } catch (err) {
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData(user.role, user.company);
      toast.success('Data refreshed!');
    } catch (err) {
      toast.error('Failed to refresh data');
    }
    setRefreshing(false);
  };

  const handleAssignClick = (file) => {
    setSelectedFile(file);
    setShowAssignModal(true);
  };

  const stats = [
    {
      title: 'Total Documents',
      value: uploadedFiles.length + tables.length,
      icon: FileSpreadsheet,
      trend: '+12%',
      trendUp: true,
      color: 'finbot',
    },
    {
      title: 'Data Tables',
      value: tables.filter(t => t.headers?.length > 0).length,
      icon: Database,
      trend: '+8%',
      trendUp: true,
      color: 'profit',
    },
    {
      title: 'Recent Uploads',
      value: uploadedFiles.length,
      icon: Upload,
      trend: 'Today',
      trendUp: true,
      color: 'purple',
    },
    {
      title: 'Your Role',
      value: user?.role?.toUpperCase() || 'N/A',
      icon: Users,
      subtitle: user?.company || 'All Companies',
      color: 'amber',
    },
  ];

  return (
    <Layout darkMode={darkMode} toggleTheme={toggleTheme}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
              Welcome back, <span className="gradient-text">{user?.name}</span>
            </h1>
            <p className="text-dark-500 dark:text-dark-400 mt-1">
              Here's your financial data overview
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3"
          >
            <button
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="btn-secondary"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload Section - Only for Analysts */}
          {user?.role === 'analyst' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <FileUpload onAssign={handleAssignClick} />
            </motion.div>
          )}

          {/* Data Tables Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={user?.role === 'analyst' ? 'lg:col-span-2' : 'lg:col-span-3'}
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-finbot-500" />
                  Financial Data
                </h2>
                <span className="text-sm text-dark-500 dark:text-dark-400">
                  {tables.length} table{tables.length !== 1 ? 's' : ''} available
                </span>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-finbot-200 border-t-finbot-600 rounded-full animate-spin" />
                    <p className="text-dark-500 dark:text-dark-400">Loading your data...</p>
                  </div>
                </div>
              ) : tables.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Database className="w-16 h-16 text-dark-300 dark:text-dark-600 mb-4" />
                  <h3 className="text-lg font-medium text-dark-700 dark:text-dark-300 mb-2">
                    No Data Available
                  </h3>
                  <p className="text-dark-500 dark:text-dark-400 max-w-md">
                    {user?.role === 'analyst' 
                      ? 'Upload a PDF to get started with financial analysis.'
                      : 'No data has been assigned to your role yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {tables.map((table, index) => (
                    <DataTable 
                      key={index} 
                      data={table} 
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Assignment Modal */}
        <AnimatePresence>
          {showAssignModal && (
            <DataAssignmentModal
              file={selectedFile}
              onClose={() => {
                setShowAssignModal(false);
                setSelectedFile(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default DashboardPage;