# Medical-Report Summarizer

![License](https://img.shields.io/badge/license-ISC-green)

## 📝 Description

A powerful web application that extracts structured medical test data from any PDF or image-based health report regardless of format, layout, or template.
Built with React, Node.js, Express, and AI-powered parsing, the system intelligently reads reports and returns clean, editable, categorized table data

## 🛠️ Tech Stack
**Backend**
- 🚀 Express.js
- 📂 Multer
- 🌐 CORS
  
**Frontend**
- ⚛️ React
- 🎨 TailwindCSS
- 🔔 lucide-react
- ⚡ Vite
  

## 📦 Key Dependencies
**Backend**
```
@google/genai: ^1.29.1
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
```
## Backend 
**Create a file**
```
backend/.env
```
**Add:**
```
GEMINI_API_KEY=your_api_key_here
PORT=5000

```

## 🚀 Run Commands

**Backend**
```
cd backend
npm install
node server.js
```
**Client**
```
cd client
npm install
npm run dev
```
## 📁 Project Structure

```
.
├── backend
│   ├── package.json
│   └── server.js
└── client
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── public
    │   └── vite.svg
    ├── src
    │   ├── App.css
    │   ├── App.jsx
    │   ├── assets
    │   │   └── react.svg
    │   ├── index.css
    │   └── main.jsx
    └── vite.config.js
```

## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/sanjayrajns/Pdf-Extractor.git`
3. **Create** a new branch: `git checkout -b feature/your-feature`
4. **Commit** your changes: `git commit -am 'Add some feature'`
5. **Push** to your branch: `git push origin feature/your-feature`
6. **Open** a pull request

Please ensure your code follows the project's style guidelines and includes tests where applicable.

## 📜 License

This project is licensed under the ISC License.

---
