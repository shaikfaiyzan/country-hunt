// Country Hunt - simple 12 x 12 word-search puzzle
const GRID_SIZE = 12;
const COUNTRY_NAMES = [
  "INDIA",
  "JAPAN",
  "CHINA",
  "NEPAL",
  "CANADA",
  "BRAZIL",
  "FRANCE",
  "EGYPT"
];

const gridElement = document.getElementById("letter-grid");
const countryListElement = document.getElementById("country-list");
const scoreElement = document.getElementById("score");
const completedElement = document.getElementById("completed");
const totalElement = document.getElementById("total");
const welcomeElement = document.getElementById("welcome");
const gameElement = document.getElementById("game");
const winMessage = document.getElementById("win-message");
const difficultySelect = document.getElementById("difficulty-select");

let grid = [];
let placements = [];
let foundCountries = new Set();
let score = 0;
let isSelecting = false;
let startCell = null;
let selectedCells = [];

// Difficulty controls the directions available for word placement.
const DIRECTIONS = {
  easy: [
    [0, 1],   // left to right
    [1, 0]    // top to bottom
  ],
  medium: [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, -1], [-1, 1]
  ],
  hard: [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, -1], [-1, 1]
  ]
};

// Shuffle an array so every restart can create a fresh puzzle.
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Place each word letter-by-letter from its intended starting cell.
function createPuzzle() {
  for (let rebuild = 0; rebuild < 100; rebuild++) {
    grid = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => "")
    );
    placements = [];
    const difficulty = difficultySelect.value;
    const directionSet = shuffle(DIRECTIONS[difficulty]);
    let complete = true;

    shuffle(COUNTRY_NAMES).forEach((word, index) => {
      const direction = directionSet[index % directionSet.length];
      const [rowStep, colStep] = direction;
      let placed = false;

      for (let attempt = 0; attempt < 1000 && !placed; attempt++) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        const endRow = row + rowStep * (word.length - 1);
        const endCol = col + colStep * (word.length - 1);

        if (endRow < 0 || endRow >= GRID_SIZE ||
            endCol < 0 || endCol >= GRID_SIZE) {
          continue;
        }

        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const r = row + rowStep * i;
          const c = col + colStep * i;
          if (grid[r][c] !== "" && grid[r][c] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            grid[row + rowStep * i][col + colStep * i] = word[i];
          }
          placements.push({
            word,
            startRow: row,
            startCol: col,
            endRow,
            endCol,
            rowStep,
            colStep
          });
          placed = true;
        }
      }

      if (!placed) complete = false;
    });

    if (complete) break;
  }

  if (placements.length !== COUNTRY_NAMES.length) {
    createPuzzle();
    return;
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === "") {
        grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

// Draw the grid and the list of countries.
function renderGame() {
  gridElement.innerHTML = "";
  countryListElement.innerHTML = "";

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const letter = document.createElement("button");
      letter.type = "button";
      letter.className = "letter";
      letter.textContent = grid[row][col];
      letter.dataset.row = row;
      letter.dataset.col = col;
      letter.setAttribute(
        "aria-label",
        `Row ${row + 1}, column ${col + 1}: ${grid[row][col]}`
      );
      gridElement.appendChild(letter);
    }
  }

  for (const country of COUNTRY_NAMES) {
    const item = document.createElement("li");
    item.className = "country-item";
    item.id = `word-${country}`;
    item.textContent = country;
    countryListElement.appendChild(item);
  }

  totalElement.textContent = COUNTRY_NAMES.length;
  completedElement.textContent = "0";
  scoreElement.textContent = "0";
}

// Reset all game state and make a new puzzle.
function startGame() {
  foundCountries = new Set();
  score = 0;
  isSelecting = false;
  startCell = null;
  selectedCells = [];
  winMessage.hidden = true;
  welcomeElement.hidden = true;
  gameElement.hidden = false;

  createPuzzle();
  renderGame();
  window.countryHuntPuzzle = { grid, placements };
}

// Find a straight line from the starting cell to the hovered/clicked cell.
function getLineCells(start, end) {
  const startRow = Number(start.dataset.row);
  const startCol = Number(start.dataset.col);
  const endRow = Number(end.dataset.row);
  const endCol = Number(end.dataset.col);
  const rowDifference = endRow - startRow;
  const colDifference = endCol - startCol;

  const isStraight = startRow === endRow ||
    startCol === endCol ||
    Math.abs(rowDifference) === Math.abs(colDifference);

  if (!isStraight) return [start];

  const rowStep = rowDifference === 0 ? 0 :
    rowDifference / Math.abs(rowDifference);
  const colStep = colDifference === 0 ? 0 :
    colDifference / Math.abs(colDifference);
  const length = Math.max(
    Math.abs(rowDifference),
    Math.abs(colDifference)
  ) + 1;
  const cells = [];

  for (let i = 0; i < length; i++) {
    const row = startRow + rowStep * i;
    const col = startCol + colStep * i;
    const cell = gridElement.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    if (cell) cells.push(cell);
  }
  return cells;
}

function clearSelection() {
  for (const cell of selectedCells) {
    if (!cell.classList.contains("found")) {
      cell.classList.remove("selecting");
    }
  }
  selectedCells = [];
}

// Validate the exact generated start, end, and direction before scoring.
function checkSelection() {
  if (selectedCells.length < 2 || !startCell) {
    clearSelection();
    return;
  }

  const endCell = selectedCells[selectedCells.length - 1];
  const startRow = Number(startCell.dataset.row);
  const startCol = Number(startCell.dataset.col);
  const endRow = Number(endCell.dataset.row);
  const endCol = Number(endCell.dataset.col);

  const placement = placements.find(item =>
    item.startRow === startRow &&
    item.startCol === startCol &&
    item.endRow === endRow &&
    item.endCol === endCol &&
    !foundCountries.has(item.word)
  );

  if (placement) {
    foundCountries.add(placement.word);
    selectedCells.forEach(cell => {
      cell.classList.remove("selecting");
      cell.classList.add("found");
    });

    document
      .getElementById(`word-${placement.word}`)
      .classList.add("found");

    score += 10;
    scoreElement.textContent = score;
    completedElement.textContent = foundCountries.size;

    if (foundCountries.size === COUNTRY_NAMES.length) {
      setTimeout(() => {
        winMessage.hidden = false;
      }, 300);
    }
  }

  clearSelection();
}

// Start selecting from the first letter.
function beginSelection(event) {
  const letter = event.target.closest(".letter");
  if (!letter) return;
  event.preventDefault();

  isSelecting = true;
  startCell = letter;
  clearSelection();
  selectedCells = [letter];
  letter.classList.add("selecting");
}

// Highlight the letters while the mouse or finger is dragged.
function moveSelection(event) {
  if (!isSelecting || !startCell) return;
  event.preventDefault();

  const point = event.touches ? event.touches[0] : event;
  const hoveredElement = event.target.closest?.(".letter");
  const element = hoveredElement ||
    document.elementFromPoint(point.clientX, point.clientY);
  const letter = element?.closest(".letter");
  if (!letter || !gridElement.contains(letter)) return;

  clearSelection();
  selectedCells = getLineCells(startCell, letter);
  selectedCells.forEach(cell => cell.classList.add("selecting"));
}

// Finish and validate the selection.
function endSelection(event) {
  if (!isSelecting) return;
  event.preventDefault?.();
  isSelecting = false;
  checkSelection();
  startCell = null;
}

document.getElementById("start-button").addEventListener("click", startGame);
document.getElementById("restart-button").addEventListener("click", startGame);
document.getElementById("play-again-button").addEventListener("click", startGame);
difficultySelect.addEventListener("change", () => {
  if (!gameElement.hidden) startGame();
});

gridElement.addEventListener("pointerdown", beginSelection);
gridElement.addEventListener("pointermove", moveSelection);
window.addEventListener("pointerup", endSelection);
gridElement.addEventListener("pointercancel", endSelection);
