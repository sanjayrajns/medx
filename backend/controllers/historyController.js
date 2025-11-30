const { db } = require("../services/firebaseService");

exports.getHistory = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const reportsSnapshot = await db.collection("extractions").doc(id).collection("reports")
      .orderBy("createdAt", "desc")
      .get();

    if (reportsSnapshot.empty) {
      return res.status(404).json({ message: "No history found for this user." });
    }

    const history = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ data: history });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history." });
  }
};
