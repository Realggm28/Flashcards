# AI Study Flashcards

AI Study Flashcards is a web app that turns study guides into flashcards.

Users can upload a file or paste study guide text, generate flashcards with an OpenAI-compatible AI endpoint, practice cards, save favorite cards, and download decks.

## Features

- Upload `.txt`, `.md`, `.csv`, `.pdf`, or `.docx` study guides
- Paste study guide text
- Automatically generate flashcards using AI
- Practice flashcards
- Mark cards as `I Know It` or `Need Practice`
- Practice only the `Need Practice` cards
- Save favorite cards
- Download full decks as JSON
- Download saved cards as JSON
- Dark mode saved in the browser with `localStorage`

## Why there is a backend

The AI API call is handled by `server.js`.

Do **not** put API keys in frontend browser JavaScript. If the key is in frontend code, other people can inspect the website and copy it.

## Option 1: Free local AI with Ollama

This is the best free setup for testing locally.

### 1. Install Ollama

Install Ollama on your computer.

### 2. Pull a small model

Example:

```bash
ollama pull qwen2.5:3b
```

You can also use another small model if your computer supports it.

### 3. Create your `.env` file

Copy `.env.example` to `.env`.

```bash
cp .env.example .env
```

Default local setup:

```env
AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=ollama
AI_MODEL=qwen2.5:3b
PORT=3000
```

### 4. Install dependencies

```bash
npm install
```

### 5. Start the app

```bash
npm start
```

Open:

```txt
http://localhost:3000
```

## Option 2: Hosted OpenAI-compatible API

Change your `.env` file:

```env
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your_api_key_here
AI_MODEL=gpt-4o-mini
PORT=3000
```

Then run:

```bash
npm install
npm start
```

## Supported upload files

- `.txt`
- `.md`
- `.csv`
- `.pdf`
- `.docx`

## Downloaded deck format

Decks download as JSON:

```json
[
  {
    "question": "What is inertia?",
    "answer": "Inertia is an object’s resistance to a change in motion."
  }
]
```

## GitHub note

Because this version needs a backend for AI generation, it will not fully work on plain GitHub Pages by itself.

GitHub Pages can host the frontend, but the AI generation endpoint needs a backend server. For the full app, deploy it somewhere that supports Node.js.

## License

MIT
