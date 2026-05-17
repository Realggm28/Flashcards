import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

dotenv.config();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024
  }
});

const PORT = process.env.PORT || 3000;
const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:11434/v1";
const AI_API_KEY = process.env.AI_API_KEY || "ollama";
const AI_MODEL = process.env.AI_MODEL || "qwen2.5:3b";

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    aiBaseUrl: AI_BASE_URL,
    model: AI_MODEL
  });
});

app.post("/api/generate-cards", upload.single("studyFile"), async (req, res) => {
  try {
    const pastedText = req.body.studyText || "";
    const requestedCount = Number(req.body.cardCount || 20);
    const cardCount = Math.min(Math.max(requestedCount, 5), 60);

    let fileText = "";

    if (req.file) {
      fileText = await extractTextFromFile(req.file);
    }

    const studyText = `${pastedText}\n\n${fileText}`.trim();

    if (!studyText) {
      return res.status(400).json({
        error: "Please upload a file or paste study guide text first."
      });
    }

    const trimmedStudyText = studyText.slice(0, 24000);
    const cards = await generateFlashcards(trimmedStudyText, cardCount);

    res.json({ cards });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "The app could not generate flashcards.",
      details: error.message
    });
  }
});

async function extractTextFromFile(file) {
  const name = file.originalname.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv")) {
    return file.buffer.toString("utf-8");
  }

  if (name.endsWith(".pdf")) {
    const parsed = await pdfParse(file.buffer);
    return parsed.text;
  }

  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  throw new Error("Unsupported file type. Please use .txt, .md, .csv, .pdf, or .docx");
}

async function generateFlashcards(studyText, cardCount) {
  const prompt = `
You are a helpful study tool. Turn this study guide into flashcards.

Rules:
- Return ONLY valid JSON.
- Do not use markdown.
- Make exactly ${cardCount} flashcards unless the text has too little information.
- Each flashcard must have a clear question and answer.
- Keep answers student-friendly and not too long.
- Prefer important vocabulary, formulas, definitions, examples, and likely quiz questions.
- Use this exact JSON shape:
{
  "cards": [
    {
      "question": "Question here",
      "answer": "Answer here"
    }
  ]
}

Study guide:
${studyText}
`;

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${AI_API_KEY}`
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You create accurate study flashcards from provided study material. Return only JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("The AI response did not include content.");
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("The AI did not return valid JSON.");
    }
    parsed = JSON.parse(match[0]);
  }

  const cards = Array.isArray(parsed.cards) ? parsed.cards : [];

  const cleanedCards = cards
    .map(card => ({
      question: String(card.question || "").trim(),
      answer: String(card.answer || "").trim()
    }))
    .filter(card => card.question && card.answer);

  if (cleanedCards.length === 0) {
    throw new Error("No valid flashcards were generated.");
  }

  return cleanedCards;
}

app.listen(PORT, () => {
  console.log(`AI Flashcards app running at http://localhost:${PORT}`);
  console.log(`Using AI endpoint: ${AI_BASE_URL}`);
  console.log(`Using model: ${AI_MODEL}`);
});
