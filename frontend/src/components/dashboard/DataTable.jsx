// src/components/dashboard/DataTable.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Download, Search, Filter } from 'lucide-react';

const DataTable = ({ data, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const { headers, rows, chunk_text } = data;

  // Filter rows based on search
  const filteredRows = rows?.filter((row) =>
    row.some((cell) =>
      String(cell).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  // Sort rows
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (index) => {
    setSortConfig((prev) => ({
      key: index,
      direction: prev.key === index && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleExport = () => {
    if (!headers || !rows) return;
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-data-${index + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // If no headers, show as text chunk
  if (!headers || headers.length === 0) {
    return (
      <div className="p-4 bg-dark-50 dark:bg-dark-800 rounded-xl">
        <p className="text-sm text-dark-600 dark:text-dark-400 whitespace-pre-wrap">
          {chunk_text || 'No data available'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="border border-dark-200 dark:border-dark-700 rounded-xl overflow-hidden bg-white dark:bg-dark-900"
    >
      {/* Table Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-finbot-100 dark:bg-finbot-900/30 rounded-lg flex items-center justify-center text-finbot-600 dark:text-finbot-400 font-semibold text-sm">
            {index + 1}
          </span>
          <div className="text-left">
            <h4 className="font-medium text-dark-900 dark:text-white">
              Table {index + 1}
            </h4>
            <p className="text-xs text-dark-500 dark:text-dark-400">
              {headers.length} columns • {rows?.length || 0} rows
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-dark-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-dark-400" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Controls */}
            <div className="flex items-center gap-3 p-4 border-t border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search in table..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-finbot-500"
                />
              </div>
              <button className="btn-secondary py-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button onClick={handleExport} className="btn-secondary py-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-100 dark:bg-dark-800">
                    {headers.map((header, idx) => (
                      <th
                        key={idx}
                        onClick={() => handleSort(idx)}
                        className="table-header px-4 py-3 cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {header}
                          {sortConfig.key === idx && (
                            <span className="text-finbot-500">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
                    >
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="table-cell">
                          {cell !== null && cell !== undefined ? String(cell) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {sortedRows.length === 0 && (
                <div className="p-8 text-center text-dark-500 dark:text-dark-400">
                  No matching data found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DataTable;