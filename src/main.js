import GoGame from "./board.js";
import { worker } from "./mocks/browser.js";

async function initMocks() {
  await worker.start();
}

import {
  blackImages,
  whiteImages,
} from "./utils/imageLoader.js";
import {
  updateCanvasSize,
  drawBoardBackground,
  drawBoard,
  getCellSize,
} from "./utils/boardRenderer.js";
import { fetchSuggestedMoves } from "./utils/suggestions.js";
import leftIcon from "./assets/icons/left.svg";
import rightIcon from "./assets/icons/right.svg";
import resetIcon from "./assets/icons/reset.svg";

const app = document.querySelector("#app");
app.innerHTML = `
  <div class="banner"><h1>Kifu Compass</h1></div>
  <div class="board-container">
    <canvas id="board"></canvas>
  </div>
  <div class="controls">
    <button id="back" title="Back" class="control-btn">
      <img src="${leftIcon}" alt="Back" />
    </button>
    <button id="forward" title="Forward" class="control-btn">
      <img src="${rightIcon}" alt="Forward" />
    </button>
    <button id="clear" title="Clear" class="control-btn">
      <img src="${resetIcon}" alt="Clear" />
    </button>
  </div>
  <div id="suggestion"></div>
`;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
// offscreen canvas used to store the static board background
const boardCanvas = document.createElement("canvas");
const boardCtx = boardCanvas.getContext("2d");
const game = new GoGame(9);


let boardImages = Array.from({ length: game.size }, () =>
  Array(game.size).fill(null)
);
let boardImagesHistory = [boardImages.map((row) => row.slice())];

let hoverPos = null;
let hoverImg = null;
let hoverColor = null;

let suggestedMoves = [];

function updateSuggestions() {
  fetchSuggestedMoves(
    game,
    (moves) => {
      suggestedMoves = moves;
    },
    () => drawBoard(ctx, boardCanvas, boardImages, suggestedMoves, hoverPos, hoverImg, game)
  );
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const cell = getCellSize();
  const x = Math.round((e.clientX - rect.left) / cell - 1);
  const y = Math.round((e.clientY - rect.top) / cell - 1);
  const oldBoard = game.cloneBoard(game.board);
  const prevIndex = game.currentIndex;
  if (game.attemptPlace(x, y)) {
    boardImages[x][y] = hoverImg;
    for (let i = 0; i < game.size; i++) {
      for (let j = 0; j < game.size; j++) {
        if (oldBoard[i][j] !== game.board[i][j] && game.board[i][j] === 0) {
          boardImages[i][j] = null;
        }
      }
    }
    boardImagesHistory = boardImagesHistory.slice(0, prevIndex + 1);
    boardImagesHistory.push(boardImages.map((row) => row.slice()));
    hoverImg = null;
    suggestedMoves = [];
    drawBoard(ctx, boardCanvas, boardImages, suggestedMoves, hoverPos, hoverImg, game);
    updateSuggestions();
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const cell = getCellSize();
  const x = Math.round((e.clientX - rect.left) / cell - 1);
  const y = Math.round((e.clientY - rect.top) / cell - 1);
  const posChanged = !hoverPos || hoverPos.x !== x || hoverPos.y !== y;
  const colorChanged = hoverColor !== game.currentPlayer;
  if (!posChanged && !colorChanged) {
    return;
  }
  const needsNewImg = colorChanged || hoverImg === null;
  hoverPos = { x, y };
  if (
    x >= 0 &&
    x < game.size &&
    y >= 0 &&
    y < game.size &&
    game.board[x][y] === 0
  ) {
    if (needsNewImg) {
      const arr = game.currentPlayer === 1 ? blackImages : whiteImages;
      hoverImg = arr[Math.floor(Math.random() * arr.length)];
      hoverColor = game.currentPlayer;
    }
  } else {
    hoverImg = null;
  }
  drawBoard(ctx, boardCanvas, boardImages, suggestedMoves, hoverPos, hoverImg, game);
});

canvas.addEventListener("mouseleave", () => {
  hoverPos = null;
  hoverImg = null;
  drawBoard(ctx, boardCanvas, boardImages, suggestedMoves, hoverPos, hoverImg, game);
});

document.getElementById("back").addEventListener("click", () => {
  if (game.undo()) {
    boardImages = boardImagesHistory[game.currentIndex].map((row) =>
      row.slice()
    );
    suggestedMoves = [];
    drawBoard(ctx, boardCanvas, boardImages, suggestedMoves, hoverPos, hoverImg, game);
    updateSuggestions();
  }
});

document.getElementById("forward").addEventListener("click", () => {
  if (game.redo()) {
    boardImages = boardImagesHistory[game.currentIndex].map((row) =>
      row.slice()
    );
    suggestedMoves = [];
    drawBoard(ctx, boardCanvas, boardImages, suggestedMoves, hoverPos, hoverImg, game);
    updateSuggestions();
  }
});

document.getElementById("clear").addEventListener("click", () => {
  game.clear();
  boardImages = Array.from({ length: game.size }, () =>
    Array(game.size).fill(null)
  );
  boardImagesHistory = [boardImages.map((row) => row.slice())];
  hoverImg = null;
  suggestedMoves = [];
  drawBoard(ctx, boardCanvas, boardImages, suggestedMoves, hoverPos, hoverImg, game);
  updateSuggestions();
});

  window.addEventListener("resize", () => {
    updateCanvasSize(canvas, boardCanvas, game);
    drawBoardBackground(boardCtx, game);
    drawBoard(ctx, boardCanvas, boardImages, suggestedMoves, hoverPos, hoverImg, game);
  });

async function init() {
  if (import.meta.env.MODE === "development") {
    await initMocks();
  }
  updateCanvasSize(canvas, boardCanvas, game);
  drawBoardBackground(boardCtx, game);
  drawBoard(ctx, boardCanvas, boardImages, suggestedMoves, hoverPos, hoverImg, game);
  updateSuggestions();
}

init();
