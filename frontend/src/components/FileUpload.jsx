// frontend/src/components/FileUpload.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { pdfAPI } from '../services/api';
import { Upload, FileText, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function FileUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const data = await pdfAPI.upload(file, (percent) => {
        setProgress(percent);
      });

      setResult(data);
      setProgress(100);
      
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : uploading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <Loader className="h-12 w-12 text-blue-500 animate-spin" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          <div>
            <p className="text-base font-medium text-gray-900">
              {uploading
                ? `Uploading... ${progress}%`
                : isDragActive
                ? 'Drop the PDF here'
                : 'Drag & drop a PDF here, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports annual reports up to 400 pages
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Success Result */}
      {result && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900">Upload Successful!</h4>
              <p className="text-sm text-green-700 mt-1">{result.message}</p>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600 font-medium">Word Count:</span>
                  <span className="ml-2 text-green-900">{result.word_count.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-green-600 font-medium">Status:</span>
                  <span className="ml-2 text-green-900">Indexed</span>
                </div>
              </div>
              {result.markdown_preview && (
                <details className="mt-3">
                  <summary className="text-sm font-medium text-green-700 cursor-pointer">
                    Preview extracted content
                  </summary>
                  <pre className="mt-2 text-xs text-gray-700 bg-white p-3 rounded border border-green-200 overflow-auto max-h-40">
                    {result.markdown_preview}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Result */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Upload Failed</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">📄 File Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• PDF files only (up to 400 pages)</li>
          <li>• Best for: Annual reports, financial statements, balance sheets</li>
          <li>• Supports scanned documents and messy tables</li>
          <li>• Processing time: ~30 seconds per 30 pages</li>
        </ul>
      </div>
    </div>
  );
}