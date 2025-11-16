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

// Primary + fallback models
const MODELS = ["gemini-2.5-pro", "gemini-1.5-flash", "gemini-1.5-pro"];


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

      return JSON.parse(response.text); // may throw
    } catch (err) {
      console.error("Gemini error:", err.message);

      // If last attempt → throw hard error
      if (attempt === MAX_RETRIES) throw err;

      // Wait before retry
      await WAIT(1000 * attempt);
    }
  }
}

app.get("/", (req, res) => res.send("AI Lab Extractor Backend Running"));

app.post("/extract", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const filePath = req.file.path;
  const mimetype = req.file.mimetype;

  try {
    const imagePart = fileToGenerativePart(filePath, mimetype);
    const prompt = "Extract lab report values accurately.";

    let data = null;
    for (const model of MODELS) {
      try {
        data = await safeGeminiExtract(model, prompt, imagePart);
        if (data) break;
      } catch (e) {
        console.log("Fallback to next model...");
      }
    }

    if (!data) throw new Error("Gemini extraction failed on all models.");

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
