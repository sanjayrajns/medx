const admin = require("firebase-admin");
const path = require("path");

// Path to your service account key file
// Ensure this file is in your backend root or config directory and added to .gitignore
const serviceAccountPath = path.join(__dirname, "../medx-f0c2b-firebase-adminsdk-fbsvc-daae3eba66.json");

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath)),
    });
    console.log("Firebase Admin Initialized");
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
}

const db = admin.firestore();

module.exports = { db };
