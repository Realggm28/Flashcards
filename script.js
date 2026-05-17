const sampleDeck = [
  {
    question: "What is inertia?",
    answer:
      "Inertia is an object’s resistance to a change in motion.\n\nAn object at rest stays at rest, and an object in motion stays in motion unless a force acts on it."
  },
  {
    question: "What is a balanced force?",
    answer:
      "Balanced forces are forces that are equal in size and opposite in direction.\n\nThey do not change an object’s motion."
  },
  {
    question: "What is an unbalanced force?",
    answer:
      "Unbalanced forces are forces that are not equal.\n\nThey cause an object to speed up, slow down, or change direction."
  },
  {
    question: "What is friction?",
    answer:
      "Friction is a force that opposes motion between two surfaces that are touching."
  },
  {
    question: "What is acceleration?",
    answer:
      "Acceleration is the change in velocity over time.\n\nIt can mean speeding up, slowing down, or changing direction."
  },
  {
    question: "What is the forces triangle?",
    answer: "Force = Mass × Acceleration\n\nF = m × a"
  }
];

let flashcards = [...sampleDeck];
let originalDeck = [...sampleDeck];
let currentCard = 0;
let flipped = false;
let knownCards = [];
let practiceCards = [];
let savedCards = JSON.parse(localStorage.getItem("savedFlashcards")) || [];

const card = document.getElementById("flashcard");
const progress = document.getElementById("progress");
const results = document.getElementById("results");
const cardContainer = document.getElementById("cardContainer");

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCardText(text) {
  return escapeHTML(text).replace(/\n/g, "<br>");
}

function showCard() {
  if (flashcards.length === 0) {
    card.innerHTML = "No flashcards loaded yet.";
    progress.innerHTML = "";
    return;
  }

  flipped = false;
  card.innerHTML = formatCardText(flashcards[currentCard].question);
  progress.innerHTML = `Card ${currentCard + 1} of ${flashcards.length}`;
}

function flipCard() {
  if (flashcards.length === 0) return;

  if (!flipped) {
    card.innerHTML = formatCardText(flashcards[currentCard].answer);
    flipped = true;
  } else {
    card.innerHTML = formatCardText(flashcards[currentCard].question);
    flipped = false;
  }
}

function markKnown() {
  if (flashcards.length === 0) return;
  knownCards.push(flashcards[currentCard]);
  nextCard();
}

function markPractice() {
  if (flashcards.length === 0) return;
  practiceCards.push(flashcards[currentCard]);
  nextCard();
}

function saveCurrentCard() {
  if (flashcards.length === 0) return;

  const current = flashcards[currentCard];
  const alreadySaved = savedCards.some(
    saved => saved.question === current.question && saved.answer === current.answer
  );

  if (!alreadySaved) {
    savedCards.push(current);
    localStorage.setItem("savedFlashcards", JSON.stringify(savedCards));
    alert("Card saved!");
  } else {
    alert("This card is already saved.");
  }
}

function nextCard() {
  if (flashcards.length === 0) return;

  currentCard++;

  if (currentCard >= flashcards.length) {
    showResults();
    return;
  }

  showCard();
}

function showResults() {
  cardContainer.style.display = "none";
  results.style.display = "block";

  fillList("knownList", knownCards);
  fillList("practiceList", practiceCards);
  fillList("savedList", savedCards);
}

function fillList(listId, cards) {
  const list = document.getElementById(listId);
  list.innerHTML = "";

  if (cards.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nothing here yet.";
    list.appendChild(li);
    return;
  }

  cards.forEach(cardData => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${formatCardText(cardData.question)}</strong><br>${formatCardText(cardData.answer)}`;
    list.appendChild(li);
  });
}

function practiceNeedsHelp() {
  if (practiceCards.length === 0) {
    alert("You do not have any Need Practice cards yet.");
    return;
  }

  flashcards = [...practiceCards];
  currentCard = 0;
  flipped = false;
  knownCards = [];
  practiceCards = [];

  results.style.display = "none";
  cardContainer.style.display = "block";
  showCard();
}

function startOver() {
  flashcards = [...originalDeck];
  currentCard = 0;
  flipped = false;
  knownCards = [];
  practiceCards = [];

  results.style.display = "none";
  cardContainer.style.display = "block";
  showCard();
}

function resetProgress() {
  knownCards = [];
  practiceCards = [];
  currentCard = 0;
  flipped = false;

  results.style.display = "none";
  cardContainer.style.display = "block";
  showCard();
}

function parseTextDeck(text) {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.includes("|"))
    .map(line => {
      const parts = line.split("|");
      const question = parts[0].trim();
      const answer = parts.slice(1).join("|").trim();
      return { question, answer };
    })
    .filter(cardData => cardData.question && cardData.answer);
}

function loadFromText() {
  const text = document.getElementById("flashcardInput").value.trim();

  if (!text) {
    alert("Paste some flashcards first.");
    return;
  }

  const newCards = parseTextDeck(text);

  if (newCards.length === 0) {
    alert("No valid cards found. Use this format: question | answer");
    return;
  }

  flashcards = newCards;
  originalDeck = [...newCards];
  resetProgress();
}

function loadSampleDeck() {
  flashcards = [...sampleDeck];
  originalDeck = [...sampleDeck];
  resetProgress();
}

function readUploadedDeck(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;
    let newCards = [];

    try {
      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          newCards = parsed.filter(cardData => cardData.question && cardData.answer);
        }
      } else {
        newCards = parseTextDeck(content);
      }
    } catch (error) {
      alert("Could not read that file.");
      return;
    }

    if (newCards.length === 0) {
      alert("No valid flashcards found in that file.");
      return;
    }

    flashcards = newCards;
    originalDeck = [...newCards];
    resetProgress();
  };

  reader.readAsText(file);
}

function downloadJSON(cards, filename) {
  const data = JSON.stringify(cards, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function downloadAllFlashcards() {
  if (flashcards.length === 0) {
    alert("No flashcards to download.");
    return;
  }

  downloadJSON(flashcards, "flashcard-deck.json");
}

function downloadSavedFlashcards() {
  if (savedCards.length === 0) {
    alert("No saved cards to download yet.");
    return;
  }

  downloadJSON(savedCards, "saved-flashcards.json");
}

function setupDarkMode() {
  const darkBtn = document.getElementById("darkModeToggle");

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

  darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  });
}

document.getElementById("flashcard").addEventListener("click", flipCard);
document.getElementById("flipBtn").addEventListener("click", flipCard);
document.getElementById("knowBtn").addEventListener("click", markKnown);
document.getElementById("practiceBtn").addEventListener("click", markPractice);
document.getElementById("saveCardBtn").addEventListener("click", saveCurrentCard);
document.getElementById("nextBtn").addEventListener("click", nextCard);
document.getElementById("loadTextBtn").addEventListener("click", loadFromText);
document.getElementById("fileUpload").addEventListener("change", readUploadedDeck);
document.getElementById("sampleDeckBtn").addEventListener("click", loadSampleDeck);
document.getElementById("downloadDeckBtn").addEventListener("click", downloadAllFlashcards);
document.getElementById("downloadSavedBtn").addEventListener("click", downloadSavedFlashcards);
document.getElementById("resetProgressBtn").addEventListener("click", resetProgress);
document.getElementById("practiceNeedsHelpBtn").addEventListener("click", practiceNeedsHelp);
document.getElementById("startOverBtn").addEventListener("click", startOver);

setupDarkMode();
showCard();
