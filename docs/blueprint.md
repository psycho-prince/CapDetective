# **App Name**: CapDetective

## Core Features:

- Text Input: Simple text input field for users to paste the message they want to analyze.
- Deception Analysis: Send the user's text to the Gemini AI model for analysis of potential deception.
- Analysis Display: Display the AI's analysis, highlighting suspicious phrases and providing reasoning.
- Verdict Generation: Use the AI model to provide a final verdict on the likelihood of dishonesty (Likely Dishonest, Unclear/Mixed, Likely Honest).

## Style Guidelines:

- Primary color: White (#FFFFFF) for a clean, modern look.
- Secondary color: Light gray (#F0F0F0) for backgrounds and subtle UI elements.
- Accent: Red (#FF4136) to highlight potentially dishonest phrases and the final verdict.
- Clean and readable sans-serif font.
- Simple, minimalist icons to represent different aspects of the analysis.
- A clean, single-column layout for easy readability.

## Original User Request:
Absolutely — here’s the **complete deployable Firebase project** for **CapCheck 🔍🟥🟨🟩**, using Firebase Functions + Gemini API + simple frontend hosted on Firebase Hosting.

---

## 🧩 Project Structure

```
capcheck/
├── functions/
│   ├── index.js          # Firebase Function (backend)
│   └── package.json      # Dependencies
├── public/
│   └── index.html        # Frontend UI
└── firebase.json         # Firebase config
```

---

## 1️⃣ `functions/package.json`

```json
{
  "name": "capcheck-functions",
  "engines": { "node": "18" },
  "main": "index.js",
  "dependencies": {
    "@google/generative-ai": "^0.5.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "firebase-functions": "^4.0.0"
  }
}
```

---

## 2️⃣ `functions/index.js` (Firebase Function)

> 🔐 Replace `"YOUR_GEMINI_API_KEY"` with your real API key

```js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");

const promptTemplate = (userText) => `
You're a deception analysis AI.

A user will paste a personal message, email, or chat log. Your task is to:

1. Detect signs of dishonesty, manipulation, evasion, or gaslighting.
2. Highlight suspicious phrases.
3. Provide short reasoning for each flag.
4. Give a final verdict:
   - "🟥 Likely Dishonest"
   - "🟨 Unclear / Mixed"
   - "🟩 Likely Honest"

Avoid being overly dramatic. Keep it short, Gen Z-friendly, and a little sarcastic if the tone fits. Format your response like this:

🧠 Analysis:
- "I was busy" → 🚩 Might be an excuse, vague wording.
- "You always overthink" → 🚩 Could be manipulative gaslighting.

📊 Verdict: 🟥 Likely Dishonest

Now analyze this message:
${userText}
`;

app.post("/analyze", async (req, res) => {
  const userText = req.body.text || "";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(promptTemplate(userText));
    const response = await result.response.text();

    res.json({ analysis: response });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("AI error");
  }
});

exports.api = functions.https.onRequest(app);
```

---

## 3️⃣ `public/index.html` (Frontend)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CapCheck 🔍</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 2rem; max-width: 600px; margin: auto; background: #f9f9f9; }
    textarea { width: 100%; height: 150px; margin-bottom: 1rem; font-size: 1rem; padding: 0.5rem; }
    button { padding: 0.6rem 1.2rem; font-size: 1rem; background: black; color: white; border: none; border-radius: 5px; }
    pre { background: #fff; padding: 1rem; border: 1px solid #ddd; white-space: pre-wrap; margin-top: 1rem; }
  </style>
</head>
<body>
  <h1>🧠 CapCheck</h1>
  <p>Paste a message and find out if it's 💯 or full of 💩</p>
  <textarea id="text" placeholder="Paste the message here..."></textarea>
  <button onclick="analyze()">Analyze</button>
  <pre id="result">🧪 Awaiting input...</pre>

  <script>
    async function analyze() {
      const text = document.getElementById("text").value;
      const result = document.getElementById("result");
      result.textContent = "🔍 Thinking...";

      const response = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      result.textContent = data.analysis || "❌ Something went wrong.";
    }
  </script>
</body>
</html>
```

---

## 4️⃣ `firebase.json` (Deploy Config)

```json
{
  "functions": {
    "source": "functions"
  },
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "/analyze", "function": "api" }
    ]
  }
}
```

---

## 🚀 Deploy Steps

```bash
# Inside your project folder
firebase init
# Select: Functions + Hosting
# Use JS for functions
# Select `public/` for hosting

cd functions
npm install
cd ..

firebase deploy
```

---

## 🌐 Once Deployed

- App opens at:  
  `https://your-app.web.app`

- AI backend:  
  `https://your-app.web.app/analyze`

---

Say the word if you want:
- 🔌 Social media share buttons
- 📲 PWA (Progressive Web App) support
- 💬 Chat-style UI

Let’s ship a Gen Z banger.
  