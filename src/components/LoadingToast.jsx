import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";

const LoadingToast = ({ isLoading, isDarkMode, onCancel, customSteps }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Define the steps of the AI analysis process
  const defaultSteps = [
    "Uploading document securely...",
    "Scanning text for medical data...",
    "Identifying parameters & ranges...",
    "Structuring final summary...",
    "Finalizing results..."
  ];

  const steps = customSteps || defaultSteps;

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      return;
    }

    // Cycle through messages every 1.5 seconds
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        // Stop at the last step so it doesn't loop indefinitely
        if (prev >= steps.length - 1) return prev; 
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading, steps.length]);

  if (!isLoading) return null;

  // Calculate progress percentage for the bar
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all">
      {/* Main Content Card */}
      <div className="w-full max-w-lg px-4">
        <div 
          className={`rounded-2xl p-10 text-center shadow-2xl transition-all duration-500 border ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-white border-gray-100'
          }`}
        >
          {/* Icon Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="bg-cyan-500/20 p-6 rounded-full animate-pulse">
                <FileText className="w-12 h-12 text-cyan-500" />
              </div>
              {/* Spinning ring around the icon */}
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-spin border-t-cyan-500"></div>
            </div>
          </div>

          {/* Dynamic Text Steps */}
          <h2 className={`text-2xl font-bold mb-3 transition-opacity duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {steps[currentStep]}
          </h2>
          
          <p className={`mb-8 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Please keep this window open.
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden relative">
            <div 
              className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500 ease-out relative" 
              style={{ width: `${progressPercentage}%` }}
            >
                {/* Optional: Shine effect on the bar */}
                <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          
          {/* Optional Cancel Button */}
          {onCancel && (
            <button 
                onClick={onCancel}
                className="mt-8 px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-medium cursor-pointer"
            >
                Cancel Process
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingToast;