// src/components/dashboard/DataAssignmentModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Building, Check, FileText } from 'lucide-react';
import { useDataStore } from '../../stores/dataStore';
import toast from 'react-hot-toast';

const DataAssignmentModal = ({ file, onClose }) => {
  const { availableRoles, availableCompanies, assignDataToRole } = useDataStore();
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setIsAssigning(true);
    try {
      const result = await assignDataToRole(file.id, selectedRole, selectedCompany);
      if (result.success) {
        toast.success(`Data assigned to ${selectedRole} successfully!`);
        onClose();
      } else {
        toast.error(result.error || 'Assignment failed');
      }
    } catch (error) {
      toast.error('Failed to assign data');
    }
    setIsAssigning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-dark-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-finbot-100 dark:bg-finbot-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-finbot-600" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-900 dark:text-white">
                Assign Data
              </h3>
              <p className="text-xs text-dark-500 dark:text-dark-400">
                Assign uploaded data to a role
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5 text-dark-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* File Info */}
          <div className="flex items-center gap-3 p-4 bg-dark-50 dark:bg-dark-800 rounded-xl">
            <FileText className="w-8 h-8 text-finbot-500" />
            <div>
              <p className="font-medium text-dark-900 dark:text-white">
                {file?.name}
              </p>
              <p className="text-xs text-dark-500 dark:text-dark-400">
                {file?.wordCount} words extracted
              </p>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedRole === role.id
                      ? 'border-finbot-500 bg-finbot-50 dark:bg-finbot-900/20'
                      : 'border-dark-200 dark:border-dark-700 hover:border-dark-300 dark:hover:border-dark-600'
                  }`}
                >
                  <span className="text-xl mb-1 block">{role.icon}</span>
                  <span className={`text-sm font-medium ${
                    selectedRole === role.id
                      ? 'text-finbot-700 dark:text-finbot-400'
                      : 'text-dark-700 dark:text-dark-300'
                  }`}>
                    {role.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Company Selection */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Select Company (Optional)
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-finbot-500"
            >
              <option value="">All Companies</option>
              {availableCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
          <button
            onClick={onClose}
            className="btn-secondary px-5"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedRole || isAssigning}
            className="btn-primary px-5"
          >
            {isAssigning ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Assigning...
              </div>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Assign Data
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DataAssignmentModal;