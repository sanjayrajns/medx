# Medical Report Summarizer

![License](https://img.shields.io/badge/license-ISC-green)

## 📝 Description

A powerful web application that extracts structured medical test data from any PDF or image-based health report regardless of format, layout, or template.
Built with React, Node.js, Express, and AI-powered parsing, the system intelligently reads reports and returns clean, editable, categorized table data.

## 🛠️ Tech Stack
**Backend**
- 🚀 Express.js
- 🔥 Firebase Admin SDK (Firestore)
- 📂 Multer
- 🌐 CORS
- 🤖 Google Gemini AI

**Frontend**
- ⚛️ React
- 🎨 TailwindCSS
- 🔔 lucide-react
- ⚡ Vite
- 🆔 uuid

## 📦 Key Dependencies
**Backend**
```
@google/genai: ^1.29.1
firebase-admin: ^13.6.0
cors: ^2.8.5
dotenv: ^17.2.3
express: ^5.1.0
multer: ^2.0.2
```
**Client**
```
react
react-dom
vite
tailwindcss
lucide-react
uuid
```

## Backend Setup

1. **Create a file** `backend/.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=3000
   ```

2. **Firebase Credentials**:
   - Place your Firebase Service Account JSON file in the `backend/` root.
   - Ensure it is named correctly or update the path in `backend/services/firebaseService.js`.

## 🚀 Run Commands

**Backend**
```bash
cd backend
npm install
node server.js
```

**Client**
```bash
npm install
npm run dev
```

## 📁 Project Structure

```
.
├── backend
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── package.json
│   ├── server.js
│   └── .env
│
└── src (Frontend)
    ├── components/
    ├── utils/
    ├── App.jsx
    ├── main.jsx
    └── index.css
```

## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/sanjayrajns/medx.git`
3. **Create** a new branch: `git checkout -b feature/your-feature`
4. **Commit** your changes: `git commit -am 'Add some feature'`
5. **Push** to your branch: `git push origin feature/your-feature`
6. **Open** a pull request

Please ensure your code follows the project's style guidelines and includes tests where applicable.

## 📜 License

This project is licensed under the ISC License.
