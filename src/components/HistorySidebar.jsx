import React from "react";
import { X, FileText, Calendar, Clock } from "lucide-react";

const HistorySidebar = ({ isOpen, onClose, historyList, onSelectReport, selectedReportId, isDarkMode }) => {
  if (!isOpen) return null;

  const formatDate = (isoString) => {
    if (!isoString) return "Unknown Date";
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Sidebar Panel */}
      <div className={`relative w-full max-w-md h-full shadow-2xl transform transition-transform duration-300 ease-in-out ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Report History
          </h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-10 ${isDarkMode ? 'hover:bg-white' : 'hover:bg-black'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto h-[calc(100vh-80px)] p-4 space-y-3">
          {historyList.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <p>No history found.</p>
            </div>
          ) : (
            historyList.map((report) => (
              <div 
                key={report.id}
                onClick={() => {
                  onSelectReport(report);
                  onClose();
                }}
                className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 group ${
                  selectedReportId === report.id 
                    ? 'border-indigo-500 bg-indigo-500/10' 
                    : isDarkMode 
                      ? 'border-gray-800 bg-gray-800/50 hover:bg-gray-800' 
                      : 'border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                      <FileText className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm truncate max-w-[180px]">
                        {report.metadata?.fileName || "Medical Report"}
                      </h3>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {(report.metadata?.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {selectedReportId === report.id && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-500 text-white">
                      Active
                    </span>
                  )}
                </div>

                <div className={`flex items-center gap-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(report.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(report.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;
