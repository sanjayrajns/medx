const fs = require("fs");
const { fileToGenerativePart } = require("../utils/fileUtils");
const { extractDataWithCheck } = require("../services/geminiService");
const { db } = require("../services/firebaseService");

exports.processExtraction = async (req, res) => {
  console.log("Processing extraction request... (Single-Pass + Disabled Cancel Check)");
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const filePath = req.file.path;
  const mimetype = req.file.mimetype;
  const silentId = req.headers["x-user-id"]; // Get Silent ID from headers

  try {
    // 1. Validation
    if (mimetype !== "application/pdf") {
      throw { status: 415, message: "Invalid file type. Only PDF allowed." };
    }

    const imagePart = fileToGenerativePart(filePath, mimetype);

    console.log("Starting single-pass extraction...");

    // 2. Single-Pass Extraction & Check
    const data = await extractDataWithCheck(imagePart);

    if (!data) {
       throw { 
        status: 415, 
        message: "Document does not appear to be a valid quantitative medical lab report." 
      };
    }

    // 3. Persistence (Blocking Save)
    
    // Check if request was aborted by client before saving
    // DISABLED: Causing false positives where completed requests are marked as aborted.
    /*
    if (req.aborted) {
        console.log("Request aborted by client. Skipping save.");
        return; 
    }
    */

    if (silentId) {
        try {
            const { age, gender, conditions } = req.body;
            
            await db.collection("extractions").doc(silentId).collection("reports").add({
                results: data.results, 
                metadata: {
                    age: age || null,
                    gender: gender || null,
                    conditions: conditions || null,
                    fileName: req.file.originalname,
                    fileSize: req.file.size
                },
                createdAt: new Date().toISOString()
            });
            console.log(`Data saved for user: ${silentId}`);
        } catch (dbError) {
            console.error("Database Save Error:", dbError);
            // We log the error but still return the data to the user
        }
    }

    // 4. Send Response
    res.json({ data });

  } catch (error) {
    console.error("Controller Error:", error);
    const status = error.status || 500;
    const message = error.message || "AI Extraction failed.";
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
        res.status(status).json({ error: message });
    }

  } finally {
    // Cleanup
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};