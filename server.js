const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/generate-formula", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "יש להזין בקשה.",
      });
    }

    const systemPrompt = `
You are an expert Excel assistant.
The user writes in Hebrew.
Your job is to convert a natural-language request into an Excel formula.

Return ONLY valid JSON in this exact structure:
{
  "formula": "string",
  "explanation": "string",
  "example": "string",
  "tips": ["string", "string"]
}

Rules:
- Prefer modern Excel formulas when appropriate.
- If the request is ambiguous, make a reasonable assumption and mention it in explanation.
- Formula must start with "=".
- Explanations must be in Hebrew.
- Keep the answer practical and clear.
- No markdown.
`;

    const userPrompt = `בקשת המשתמש: ${prompt}`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const content = response.choices?.[0]?.message?.content?.trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      return res.status(500).json({
        error: "התקבלה תשובה לא תקינה מהשרת.",
        raw: content
      });
    }

    return res.json(parsed);
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "אירעה שגיאה בשרת. נסי שוב."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
