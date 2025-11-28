import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import ActionButtons from "./Results/ActionButtons";
import SummaryCards from "./Results/SummaryCards";
import ReportTable from "./Results/ReportTable";
import LoadingToast from "./LoadingToast";
import { API_ENDPOINT } from "../utils/constants";
import { groupByHeading } from "../utils/helpers";
import { getSilentId } from "../utils/idUtils";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize from navigation state if available
  const initialData = location.state?.data?.results || [];
  
  const [groupedResults, setGroupedResults] = useState(
    initialData.length > 0 ? groupByHeading(initialData) : {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load history if no initial data provided
  useEffect(() => {
    if (Object.keys(groupedResults).length === 0) {
      const fetchHistory = async () => {
        const silentId = getSilentId();
        try {
          setIsLoading(true);
          const baseUrl = API_ENDPOINT.replace('/extract', ''); 
          const res = await fetch(`${baseUrl}/history/${silentId}`);
          
          if (res.ok) {
            const historyData = await res.json();
            if (historyData.data && historyData.data.results) {
               const grouped = groupByHeading(historyData.data.results);
               setGroupedResults(grouped);
            }
          }
        } catch (err) {
          console.error("Failed to load history:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
  }, []);

  const handleCellChange = (e, heading, index, key) => {
    const updated = { ...groupedResults };
    if (updated[heading] && updated[heading][index]) {
        updated[heading][index][key] = e.target.textContent;
        setGroupedResults(updated);
    }
  };

  const handleUploadNew = () => {
    navigate("/");
  };

  const totalEntries = Object.values(groupedResults).reduce((sum, rows) => sum + rows.length, 0);
  const totalSections = Object.keys(groupedResults).length;
  const hasResults = totalEntries > 0;

  return (
    <div className={`min-h-screen transition-colors duration-500 font-montserrat ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <LoadingToast isLoading={isLoading} isDarkMode={isDarkMode} />

        {hasResults ? (
          <>
            <ActionButtons 
              onUploadNew={handleUploadNew} 
              onPrint={() => window.print()} 
              isDarkMode={isDarkMode} 
            />
            
            <SummaryCards 
              totalEntries={totalEntries} 
              totalSections={totalSections} 
              isDarkMode={isDarkMode} 
            />
            
            <ReportTable 
              groupedResults={groupedResults} 
              isDarkMode={isDarkMode} 
              handleCellChange={handleCellChange} 
            />
          </>
        ) : (
          !isLoading && (
            <div className={`text-center py-20 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <h2 className="text-2xl font-semibold mb-4">No Analysis Results Found</h2>
              <p className="mb-8">Upload a medical report to see the analysis here.</p>
              <button
                onClick={handleUploadNew}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                Upload New Report
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
