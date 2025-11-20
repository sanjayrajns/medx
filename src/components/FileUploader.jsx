import React from "react";
import { Upload } from "lucide-react";
import { SUPPORTED_REPORT_TYPES } from "../utils/constants";

const FileUploader = ({ isDarkMode, file, handleFileChange, isLoading }) => {
  // Don't show if loading (optional based on your original logic)
  if (isLoading) return null; 

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-xl p-12 text-center mb-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-lg'}`}>
        <label htmlFor="fileElem" className="cursor-pointer block">
          <div className="flex justify-center mb-6">
            <div className="bg-cyan-500 p-6 rounded-full">
              <Upload className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Your Medical Report</h2>
          <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Drop your PDF or click to browse
          </p>

          <input
            type="file"
            accept="image/*,application/pdf"
            id="fileElem"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {file && (
            <div className={`rounded-lg p-4 mb-4 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-cyan-50'}`} onClick={(e) => e.preventDefault()}>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </label>
      </div>

      <div className="mt-12">
        <h3 className={`text-xl font-bold text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Supported Medical Report Types
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {SUPPORTED_REPORT_TYPES.map((type) => (
            <span
              key={type}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-cyan-300 border border-cyan-500/50' : 'bg-white text-cyan-700 shadow border border-cyan-200'}`}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
