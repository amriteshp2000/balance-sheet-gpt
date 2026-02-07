// src/stores/dataStore.js
import { create } from 'zustand';
import { dashboardAPI, uploadAPI } from '../services/api';

export const useDataStore = create((set, get) => ({
  tables: [],
  uploadedFiles: [],
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  lastFetch: null,

  // Available roles for assignment (can be fetched from backend)
  availableRoles: [
    { id: 'ceo', label: 'CEO', icon: '👔' },
    { id: 'cfo', label: 'CFO', icon: '💰' },
    { id: 'analyst', label: 'Analyst', icon: '📊' },
    { id: 'accountant', label: 'Accountant', icon: '📋' },
    { id: 'manager', label: 'Manager', icon: '👤' },
    { id: 'auditor', label: 'Auditor', icon: '🔍' },
  ],

  availableCompanies: [
    { id: 'company_a', label: 'Company A' },
    { id: 'company_b', label: 'Company B' },
    { id: 'company_c', label: 'Company C' },
  ],

  fetchDashboardData: async (role, company) => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await dashboardAPI.getData(role, company);
      
      set({
        tables: data.tables || [],
        isLoading: false,
        lastFetch: new Date().toISOString(),
      });
      
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch data';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  uploadFile: async (file) => {
    set({ isUploading: true, uploadProgress: 0, error: null });
    
    try {
      const result = await uploadAPI.uploadPDF(file, (progress) => {
        set({ uploadProgress: progress });
      });
      
      const uploadedFile = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        wordCount: result.word_count,
        uploadedAt: new Date().toISOString(),
        status: 'success',
        assignedTo: null,
      };
      
      set((state) => ({
        uploadedFiles: [uploadedFile, ...state.uploadedFiles],
        isUploading: false,
        uploadProgress: 100,
      }));
      
      return { success: true, file: uploadedFile, result };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Upload failed';
      set({ error: errorMsg, isUploading: false, uploadProgress: 0 });
      return { success: false, error: errorMsg };
    }
  },

  assignDataToRole: async (fileId, targetRole, targetCompany) => {
    try {
      // This would call the backend API
      // For now, we'll just update the local state
      set((state) => ({
        uploadedFiles: state.uploadedFiles.map((f) =>
          f.id === fileId
            ? { ...f, assignedTo: { role: targetRole, company: targetCompany } }
            : f
        ),
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),
  
  clearUploadedFiles: () => set({ uploadedFiles: [] }),
}));