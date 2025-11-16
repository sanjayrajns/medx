import React, { useState } from "react";
import { Upload, FileText, Layers, Printer, Moon, Sun } from "lucide-react";

const TABLE_HEADERS = [
  { key: "test_name", label: "Test Name" },
  { key: "result", label: "Result" },
  { key: "unit", label: "Unit" },
  { key: "biological_reference_interval", label: "Reference Interval" },
];

function App() {
  const [file, setFile] = useState(null);
  const [groupedResults, setGroupedResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const API_ENDPOINT = "http://localhost:3000/extract";

  // FILE CHANGE
  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setGroupedResults({});
    setError("");
  };

  // GROUP BY HEADING
  const groupByHeading = (results) => {
    const grouped = {};
    results.forEach((item) => {
      if (!grouped[item.heading]) grouped[item.heading] = [];
      grouped[item.heading].push(item);
    });
    return grouped;
  };

  // SEND FILE TO BACKEND
  const handleExtract = async () => {
    if (!file) return setError("Please select a file first.");

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Extraction failed");
      }

      const data = await res.json();
      const grouped = groupByHeading(data.data.results || []);
      setGroupedResults(grouped);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // EDIT CELL
  const handleCellChange = (e, heading, index, key) => {
    const updated = { ...groupedResults };
    updated[heading][index][key] = e.target.textContent;
    setGroupedResults(updated);
  };

  // CALCULATE TOTALS
  const getTotalEntries = () => {
    return Object.values(groupedResults).reduce((sum, rows) => sum + rows.length, 0);
  };

  const getTotalSections = () => {
    return Object.keys(groupedResults).length;
  };

  // PRINT REPORT
  const handlePrint = () => {
    window.print();
  };

  // UPLOAD NEW REPORT
  const handleUploadNew = () => {
    setFile(null);
    setGroupedResults({});
    setError("");
  };

  // RENDER TABLES
  const renderTables = () => (
    <>
      {Object.entries(groupedResults).map(([heading, rows]) => (
        <div key={heading} className="mb-8">
          <div className={`rounded-lg overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-lg'}`}>
            <div className={`px-6 py-4 border-b transition-colors duration-500 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{heading}</h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tests: {rows.length}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-950 text-gray-300' : 'bg-cyan-50 text-gray-700'}`}>
                    {TABLE_HEADERS.map((h) => (
                      <th key={h.key} className="py-3 px-6 text-left font-semibold">
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b transition-colors duration-500 ${isDarkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-cyan-50'}`}
                    >
                      {TABLE_HEADERS.map((h) => (
                        <td
                          key={h.key}
                          className={`py-4 px-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleCellChange(e, heading, index, h.key)
                          }
                        >
                          {row[h.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </>
  );

  const hasResults = Object.keys(groupedResults).length > 0;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* HEADER */}
      <div className={`py-6 px-8 shadow-lg transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-r from-gray-900 via-black to-gray-900' : 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">PDF Extractor</h1>
              <p className="text-sm text-cyan-50">Extract structured data from any PDF document</p>
            </div>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-white" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {!hasResults && !isLoading && (
          <div className="max-w-2xl mx-auto">
            {/* UPLOAD SECTION */}
            <div className={`rounded-xl p-12 text-center mb-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-lg'}`}>
              <label htmlFor="fileElem" className="cursor-pointer block">
                <div className="flex justify-center mb-6">
                  <div className="bg-cyan-500 p-6 rounded-full">
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Your Document</h2>
                <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Drop your PDF document here or click to browse
                </p>

                <input
                  type="file"
                  accept="image/*,application/pdf"
                  id="fileElem"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {!file ? (
                  <div className="inline-block bg-cyan-500 hover:bg-cyan-600 px-8 py-3 text-white rounded-lg font-semibold transition-colors">
                    Choose File
                  </div>
                ) : (
                  <div className={`rounded-lg p-4 mb-4 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-cyan-50'}`} onClick={(e) => e.preventDefault()}>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                <p className="text-sm text-cyan-500 mt-4">Supported format: PDF</p>
              </label>
            </div>

            {file && (
              <div className="text-center">
                <button
                  onClick={handleExtract}
                  disabled={isLoading}
                  className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 px-8 py-3 rounded-lg text-white font-bold transition-colors"
                >
                  {isLoading ? "Processing..." : "Extract Data"}
                </button>
              </div>
            )}

            {error && (
              <div className={`border p-4 rounded-lg mt-4 ${isDarkMode ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-red-50 border-red-300 text-red-800'}`}>
                {error}
              </div>
            )}

            {/* SUPPORTED TYPES */}
            <div className="mt-12">
              <h3 className={`text-xl font-bold text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Supported Document Types
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {["Medical Reports", "Lab Results", "Invoices", "Receipts", "Forms", "Data Tables", "Financial Reports"].map((type) => (
                  <span
                    key={type}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-gray-300 border border-gray-800' : 'bg-white text-gray-700 shadow'}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-xl p-12 text-center transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-lg'}`}>
              <div className="flex justify-center mb-6">
                <div className="bg-cyan-500 p-6 rounded-full animate-pulse">
                  <FileText className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Processing Report...</h2>
              <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Please wait for some moment, your document is being processed
              </p>

              <p className="text-sm text-cyan-500">Supported format: PDF</p>
            </div>

            <div className={`rounded-lg p-4 mt-4 flex items-center gap-3 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow'}`}>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-500 border-t-transparent"></div>
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>Please wait for some moment, your document is being processed...</p>
            </div>
          </div>
        )}

        {hasResults && (
          <>
            {/* ACTION BUTTONS */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleUploadNew}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 hover:bg-gray-800 text-white border border-gray-800' : 'bg-white hover:bg-gray-50 text-gray-900 shadow border border-gray-200'}`}
              >
                <Upload className="w-4 h-4" />
                Upload New Report
              </button>
              <button
                onClick={handlePrint}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 hover:bg-gray-800 text-white border border-gray-800' : 'bg-white hover:bg-gray-50 text-gray-900 shadow border border-gray-200'}`}
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`rounded-lg p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-lg'}`}>
                <div className="flex items-center gap-4">
                  <div className="bg-cyan-500 p-4 rounded-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Entries</p>
                    <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getTotalEntries()}</p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Extracted from document</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#1e2a3a]' : 'bg-white shadow-lg'}`}>
                <div className="flex items-center gap-4">
                  <div className="bg-cyan-500 p-4 rounded-lg">
                    <Layers className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sections Found</p>
                    <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getTotalSections()}</p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Data categories</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLES */}
            {renderTables()}
          </>
        )}
      </div>
    </div>
  );
}

export default App;