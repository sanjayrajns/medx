const { ai, MODELS } = require("../config/aiConfig");
const { labReportSchema } = require("../utils/schemas");

/**
 * Single-pass function to check validity and extract data.
 * Returns null if not a valid medical report.
 */
async function extractDataWithCheck(filePart) {
  const model = MODELS[0]; // Use the first model (gemini-2.5-flash)
  
  const prompt = `
    Analyze this document. 
    1. First, determine if this is a valid quantitative medical lab report (blood test, urine test, etc.).
    2. If it is NOT a medical report, or if it is a prescription/bill/scan image without lab results, return an empty object: { "results": [] }.
    3. If it IS a valid report, extract all test results into the "results" array.
    
    For each test result, extract:
    - heading (section name like HEMATOLOGY, LIPID PROFILE). If missing, use "N/A".
    - test_name (parameter name). If missing, use "N/A".
    - result (value). If missing, use "N/A".
    - unit (measurement unit). If missing, use "N/A".

    Ignore reference intervals.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { 
            role: "user", 
            parts: [
                { text: prompt }, 
                filePart 
            ] 
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: labReportSchema,
      },
    });

    // Robust text extraction to handle different SDK versions/responses
    let text;
    if (typeof response.text === 'function') {
        text = response.text();
    } else if (response.text) {
        text = response.text;
    } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
        text = response.candidates[0].content.parts[0].text;
    } else {
        console.error("Unexpected Gemini response structure:", JSON.stringify(response, null, 2));
        throw new Error("Invalid response from AI model.");
    }
    
    // Clean up markdown code blocks if present
    if (typeof text === 'string') {
        text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    
    const data = JSON.parse(text);

    // Validation check: If results array is empty, treat as invalid/non-medical
    if (!data.results || data.results.length === 0) {
        return null; 
    }

    // Post-processing: Ensure all fields have "N/A" if empty
    data.results = data.results.map(item => ({
        heading: item.heading || "N/A",
        test_name: item.test_name || "N/A",
        result: item.result || "N/A",
        unit: item.unit || "N/A"
    }));

    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process document with AI.");
  }
}

module.exports = { extractDataWithCheck };