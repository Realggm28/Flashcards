# Study Flashcards

A simple flashcard web app that lets users create, upload, save, and practice flashcards.

## Features

- Create flashcards by pasting text
- Upload flashcard decks as `.txt` or `.json`
- Export/download full decks
- Save favorite cards
- Download saved cards
- Practice only the cards marked `Need Practice`
- Dark mode that stays on after reloading
- Works without a backend

## How to Use

Open `index.html` in your browser.

### Text deck format

Use one flashcard per line:

```txt
question | answer
What is inertia? | Inertia is an object’s resistance to a change in motion.
What is friction? | Friction is a force that opposes motion.
```

### JSON deck format

```json
[
  {
    "question": "What is inertia?",
    "answer": "Inertia is an object’s resistance to a change in motion."
  },
  {
    "question": "What is friction?",
    "answer": "Friction is a force that opposes motion."
  }
]
```

## GitHub Pages

This app can be hosted for free with GitHub Pages.

1. Create a new GitHub repository.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md`.
3. Go to Settings → Pages.
4. Choose the main branch.
5. Save, then open your GitHub Pages link.

## License

MIT License
