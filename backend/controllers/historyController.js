const { db } = require("../services/firebaseService");

exports.getHistory = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const docRef = db.collection("extractions").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "No history found for this user." });
    }

    res.json({ data: doc.data() });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history." });
  }
};
