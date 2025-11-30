const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const extractionRoutes = require("./routes/extractionRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["POST", "GET"],
  allowedHeaders: ["Content-Type", "x-user-id"],
}));

// Routes
app.get("/", (req, res) => res.send("AI Lab Extractor Backend Running"));
app.use("/api", extractionRoutes); // Access via http://localhost:3000/api/extract

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});