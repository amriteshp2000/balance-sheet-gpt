// frontend/src/components/DashboardTable.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Table as TableIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DashboardTable({ table }) {
  const { headers, rows, chunk_text } = table;

  // If it's a proper table
  const isTable = headers && headers.length > 0;

  // Prepare data for chart
  const chartData = isTable && rows.length > 0
    ? rows.map((row, idx) => {
        const dataPoint = { name: row[0] || `Row ${idx + 1}` };
        headers.slice(1).forEach((header, i) => {
          const value = parseFloat(String(row[i + 1]).replace(/,/g, ''));
          if (!isNaN(value)) {
            dataPoint[header] = value;
          }
        });
        return dataPoint;
      })
    : [];

  const hasNumericData = chartData.length > 0 && 
    chartData.some(point => Object.keys(point).length > 1);

  const downloadCSV = () => {
    if (!isTable) return;

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isTable) {
    // Render as markdown text
    return (
      <div className="bg-gray-50 rounded-lg p-4 prose prose-sm max-w-none">
        <ReactMarkdown>{chunk_text}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Table View */}
      <div className="bg-white">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon size={16} className="text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Table View</h3>
          </div>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={14} />
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50">
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart View */}
      {hasNumericData && (
        <div className="bg-white border-t border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">📊 Chart View</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {headers.slice(1).map((header, idx) => (
                <Line
                  key={header}
                  type="monotone"
                  dataKey={header}
                  stroke={`hsl(${idx * 60}, 70%, 50%)`}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}