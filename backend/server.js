const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const { GoogleGenAI, Type } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, "uploads");


app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  })
);


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro"
];

const PRE_CHECK_MODEL = "gemini-2.5-flash";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

const labReportSchema = {
  type: Type.OBJECT,
  properties: {
    results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          test_name: { type: Type.STRING },
          result: { type: Type.STRING },
          unit: { type: Type.STRING },
          biological_reference_interval: { type: Type.STRING },
        },
        required: [
          "heading",
          "test_name",
          "result",
          "unit",
          "biological_reference_interval",
        ],
      },
    },
  },
};


function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
}


async function safeGeminiExtract(model, prompt, imagePart) {
  const MAX_RETRIES = 3; 
  const WAIT = (ms) => new Promise((r) => setTimeout(r, ms));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Gemini attempt ${attempt} using model ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
        config: {
          systemInstruction:
            "Extract heading, test_name, result, unit, reference interval. Return valid JSON only.",
          responseMimeType: "application/json",
          responseSchema: labReportSchema,
        },
      });

      return JSON.parse(response.text); 
    } catch (err) {
      const isUnavailableError = err.message && (
          err.message.includes('"code":5') ||
          err.message.toLowerCase().includes('unavailable') || 
          err.message.toLowerCase().includes('service is currently being updated')
      );
      const isPermanentError = err.message && (
          err.message.includes('"code":404') || 
          err.message.includes('"code":429')
      );

      console.error(`Gemini error on model ${model} (Attempt ${attempt}):`, err.message);

      if (attempt === MAX_RETRIES || isPermanentError) {
          console.log(`Stopping retries for ${model}. Triggering model fallback...`);
          throw err;
      }
      
      if (isUnavailableError) {
          console.log(`API UNAVAILABLE. Waiting for ${1000 * attempt}ms before retry...`);
          await WAIT(1000 * attempt);
          continue;
      }
      
      console.log(`Non-retriable error for ${model}. Triggering model fallback...`);
      throw err;
    }
  }
  throw new Error(`Exceeded maximum retries (${MAX_RETRIES}) for model ${model}.`);
}

async function preliminaryCheck(imagePart) {
  const prompt = `Analyze this document. Is it a medical lab report, such as a Blood Test, CBP, Lipid Profile, Thyroid Panel, or Urine Analysis?
  Answer strictly with 'YES' or 'NO' only. Do not add any other text.`;

  try {
    const response = await ai.models.generateContent({
      model: PRE_CHECK_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
    });

    const answer = response.text.trim().toUpperCase();
    return answer === 'YES';
  } catch (err) {
    console.error("Preliminary check error:", err.message);
    return true; 
  }
}


app.get("/", (req, res) => res.send("AI Lab Extractor Backend Running"));

app.post("/extract", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const filePath = req.file.path;
  const mimetype = req.file.mimetype;

  try {
    const imagePart = fileToGenerativePart(filePath, mimetype);
    
    const isMedicalReport = await preliminaryCheck(imagePart);

    if (!isMedicalReport) {
      console.log("Document is not a medical lab report. Aborting AI extraction.");
      return res.status(415).json({
        error: "Uploaded file is not a recognizable medical lab report (e.g., Lipid Profile, CBP). Please upload a valid report.",
      });
    }
    
    console.log(`Document confirmed as a medical lab report. Attempting extraction with primary model: ${MODELS[0]}`);
    
    const prompt = "Extract lab report values accurately.";

    let data = null;
    for (const model of MODELS) {
      try {
        data = await safeGeminiExtract(model, prompt, imagePart);
        if (data) break;
      } catch (e) {
        console.log(`Error with model ${model}. Falling back to next model...`);
      }
    }

    if (!data) throw new Error(`Gemini extraction failed on all models: ${MODELS.join(', ')}.`);

    res.json({ data });
  } catch (error) {
    console.error("Final Extraction Error:", error);
    res.status(500).json({ error: "AI Extraction failed. Please try again." });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});
  
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});