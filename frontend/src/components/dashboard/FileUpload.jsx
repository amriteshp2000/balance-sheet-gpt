// src/components/dashboard/FileUpload.jsx
import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Check, 
  X, 
  AlertCircle,
  Users,
  MoreVertical
} from 'lucide-react';
import { useDataStore } from '../../stores/dataStore';
import toast from 'react-hot-toast';

const FileUpload = ({ onAssign }) => {
  const { uploadFile, uploadedFiles, isUploading, uploadProgress } = useDataStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
    const pdfFiles = files.filter((file) => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      toast.error('Please upload PDF files only');
      return;
    }

    for (const file of pdfFiles) {
      const result = await uploadFile(file);
      if (result.success) {
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        toast.error(result.error || 'Upload failed');
      }
    }
  }, [uploadFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-finbot-500" />
        Upload Documents
      </h2>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-finbot-500 bg-finbot-50 dark:bg-finbot-900/20'
            : 'border-dark-300 dark:border-dark-600 hover:border-finbot-400 dark:hover:border-finbot-600'
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleDrop}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
            isDragging 
              ? 'bg-finbot-100 dark:bg-finbot-800/50' 
              : 'bg-dark-100 dark:bg-dark-800'
          }`}>
            <Upload className={`w-7 h-7 ${
              isDragging ? 'text-finbot-600' : 'text-dark-400'
            }`} />
          </div>
          
          <p className="text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            {isDragging ? 'Drop your files here' : 'Drag & drop PDF files'}
          </p>
          <p className="text-xs text-dark-500 dark:text-dark-400">
            or click to browse
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-dark-500 mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                className="h-full bg-finbot-500 rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
            Recent Uploads
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-800 rounded-xl"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    file.status === 'success' 
                      ? 'bg-profit/10 text-profit' 
                      : 'bg-loss/10 text-loss'
                  }`}>
                    {file.status === 'success' ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">
                      {file.wordCount} words
                      {file.assignedTo && (
                        <span className="ml-2 text-finbot-500">
                          → {file.assignedTo.role}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Assign Button */}
                    <button
                      onClick={() => onAssign(file)}
                      className="p-2 rounded-lg hover:bg-dark-200 dark:hover:bg-dark-700 text-dark-500 hover:text-finbot-600 transition-colors"
                      title="Assign to role"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    
                    {/* Status Icon */}
                    {file.status === 'success' ? (
                      <div className="p-1.5 rounded-full bg-profit/10">
                        <Check className="w-3.5 h-3.5 text-profit" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-full bg-loss/10">
                        <X className="w-3.5 h-3.5 text-loss" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;