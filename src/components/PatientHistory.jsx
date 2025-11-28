import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import FileUploader from "./FileUploader"; 
import LoadingToast from "./LoadingToast";
import { API_ENDPOINT } from "../utils/constants"; 
import { getSilentId } from "../utils/idUtils";

export default function PatientHistory() {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [conditions, setConditions] = useState("");
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [isDarkMode, setIsDarkMode] = useState(true); 

  const handleFileChange = (event) => {
    setErrorMsg("");
    const selectedFile = event.target.files?.[0] || null;
    
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setErrorMsg("Please upload a PDF file.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById("fileElem");
    if (fileInput) fileInput.value = "";
  };

  const handleSkip = () => {
    handleRemoveFile(); // Clear file before skipping
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Manual Validation Check (though 'required' attribute handles basic UI)
    if (!age || !gender || !file) {
        setErrorMsg("Age, Gender and File are mandatory.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("age", age);
    formData.append("gender", gender);
    if (conditions) formData.append("conditions", conditions);

    // Removed toast.loading as we are using LoadingToast component
    
    try {
      setIsProcessing(true);
      const silentId = getSilentId();
      
      const response = await axios.post(
        API_ENDPOINT, 
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "x-user-id": silentId
          },
        }
      );
      
      toast.success("Analysis complete!");
      navigate("/dashboard", { state: response.data });
    } catch (error) {
      console.error("Upload failed:", error);
      const msg = error.response?.data?.error || "Upload failed. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen flex justify-center items-center p-6 transition-colors duration-500 font-montserrat ${isDarkMode ? 'bg-black' : 'bg-gradient-to-b from-indigo-100 to-white'}`}>
      <LoadingToast isLoading={isProcessing} isDarkMode={isDarkMode} />
      
      <div className={`w-full max-w-xl shadow-xl rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <h2 className={`text-2xl font-bold text-center mb-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>Patient History</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Age <span className="text-red-500">*</span></label>
            <input
              type="number"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={`w-full mt-1 p-3 border rounded-lg cursor-pointer [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' : 'bg-white border-gray-300 focus:border-indigo-500'}`}
            />
          </div>
          <div>
            <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Gender <span className="text-red-500">*</span></label>
            <select
              required
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full mt-1 p-3 border rounded-lg cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' : 'bg-white border-gray-300 focus:border-indigo-500'}`}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Other Conditions</label>
            <textarea
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="e.g., Hypertension, Thyroid..."
              className={`w-full mt-1 p-3 border rounded-lg cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' : 'bg-white border-gray-300 focus:border-indigo-500'}`}
            />
          </div>
          <div>
            <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Upload Report <span className="text-red-500">*</span></label>
            <div className="mt-2 cursor-pointer">
              <FileUploader 
                isDarkMode={isDarkMode}
                file={file}
                handleFileChange={handleFileChange}
                isLoading={isProcessing}
              />
            </div>
            
            {file && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-sm text-red-600 hover:underline cursor-pointer"
                >
                  Remove Selected File
                </button>
              </div>
            )}

            {errorMsg && <div className="mt-2 text-sm text-red-600">{errorMsg}</div>}
          </div>
          <button
            type="submit"
            disabled={isProcessing} 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {isProcessing ? "Processing..." : "Continue"}
          </button>
        </form>
        
        <button
          onClick={handleSkip}
          className="w-full mt-4 border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg hover:bg-indigo-50/10 cursor-pointer transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
