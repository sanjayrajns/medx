const fs = require("fs");
const { fileToGenerativePart } = require("../utils/fileUtils");
const { performPreliminaryCheck, extractData } = require("../services/geminiService");
const { db } = require("../services/firebaseService");

exports.processExtraction = async (req, res) => {
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

    // 2. AI Logic Check
    const isMedicalReport = await performPreliminaryCheck(imagePart);
    if (!isMedicalReport) {
      throw { 
        status: 415, 
        message: "Document does not appear to be a valid quantitative medical lab report." 
      };
    }

    console.log("Document verified. Starting extraction...");

    // 3. Extraction
    const data = await extractData(imagePart);
    
    // 4. Persistence (Save if Silent ID is present)
    if (silentId) {
        try {
            const { age, gender, conditions } = req.body;
            
            await db.collection("extractions").doc(silentId).set({
                results: data.results, 
                metadata: {
                    age: age || null,
                    gender: gender || null,
                    conditions: conditions || null,
                    fileName: req.file.originalname,
                    fileSize: req.file.size
                },
                updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log(`Data saved for user: ${silentId}`);
        } catch (dbError) {
            console.error("Database Save Error:", dbError);
            // Don't fail the request if save fails, just log it
        }
    }

    res.json({ data });

  } catch (error) {
    console.error("Controller Error:", error);
    const status = error.status || 500;
    const message = error.message || "AI Extraction failed.";
    res.status(status).json({ error: message });

  } finally {
    // Cleanup
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};