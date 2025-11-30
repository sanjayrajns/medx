import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { History } from "lucide-react";
import Header from "./Header";
import ActionButtons from "./Results/ActionButtons";
import SummaryCards from "./Results/SummaryCards";
import ReportTable from "./Results/ReportTable";
import LoadingToast from "./LoadingToast";
import HistorySidebar from "./HistorySidebar";
import ScrollToTop from "./ScrollToTop";
import { API_ENDPOINT } from "../utils/constants";
import { groupByHeading } from "../utils/helpers";
import { getSilentId } from "../utils/idUtils";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for History
  const [historyList, setHistoryList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Initialize from navigation state if available
  const initialData = location.state?.data;
  
  const [groupedResults, setGroupedResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Fetch History List on Mount
  useEffect(() => {
    const fetchHistory = async () => {
      const silentId = getSilentId();
      try {
        setIsLoading(true);
        const baseUrl = API_ENDPOINT.replace('/extract', ''); 
        const res = await fetch(`${baseUrl}/history/${silentId}`);
        
        if (res.ok) {
          const historyData = await res.json();
          const list = historyData.data || [];
          setHistoryList(list);

          // If we have initial data from upload, use it. 
          // Otherwise, default to the most recent report from history.
          if (initialData) {
              setSelectedReport(initialData); // This might need adaptation if initialData structure differs from history item
              setGroupedResults(groupByHeading(initialData.results || []));
          } else if (list.length > 0) {
              setSelectedReport(list[0]);
              setGroupedResults(groupByHeading(list[0].results || []));
          }
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [initialData]);

  // Handle Report Selection from Sidebar
  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setGroupedResults(groupByHeading(report.results || []));
  };

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

      {/* History Sidebar */}
      <HistorySidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        historyList={historyList} 
        onSelectReport={handleSelectReport}
        selectedReportId={selectedReport?.id}
        isDarkMode={isDarkMode}
      />

      <ScrollToTop isDarkMode={isDarkMode} />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <LoadingToast 
          isLoading={isLoading} 
          isDarkMode={isDarkMode} 
          customSteps={["Loading your history..."]}
        />

        {/* Top Bar with History Button */}
        <div className="flex justify-end mb-4">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'}`}
            >
                <History className="w-5 h-5" />
                History
            </button>
        </div>

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
