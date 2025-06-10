import GoGame from './board.js';
import { worker } from './mocks/browser.js';

worker.start();

import black00 from './assets/stones/black00_128.png';
import black01 from './assets/stones/black01_128.png';
import black02 from './assets/stones/black02_128.png';
import black03 from './assets/stones/black03_128.png';
import white00 from './assets/stones/white00_128.png';
import white01 from './assets/stones/white01_128.png';
import white02 from './assets/stones/white02_128.png';
import white03 from './assets/stones/white03_128.png';
import white04 from './assets/stones/white04_128.png';
import white05 from './assets/stones/white05_128.png';
import white06 from './assets/stones/white06_128.png';
import white07 from './assets/stones/white07_128.png';
import white08 from './assets/stones/white08_128.png';
import white09 from './assets/stones/white09_128.png';
import white10 from './assets/stones/white10_128.png';
import leftIcon from './assets/icons/left.svg';
import rightIcon from './assets/icons/right.svg';
import resetIcon from './assets/icons/reset.svg';

const app = document.querySelector('#app');
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

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const game = new GoGame(9);

const blackSources = [black00, black01, black02, black03];
const whiteSources = [
  white00,
  white01,
  white02,
  white03,
  white04,
  white05,
  white06,
  white07,
  white08,
  white09,
  white10,
];

function createImages(srcArr) {
  return srcArr.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });
}

const blackImages = createImages(blackSources);
const whiteImages = createImages(whiteSources);

let boardImages = Array.from({ length: game.size }, () => Array(game.size).fill(null));
let boardImagesHistory = [boardImages.map((row) => row.slice())];

let hoverPos = null;
let hoverImg = null;
let hoverColor = null;

let CELL_SIZE;

function updateCanvasSize() {
  const container = canvas.parentElement;
  const header = document.querySelector('.banner');
  const controls = document.querySelector('.controls');
  const suggestion = document.getElementById('suggestion');

  const paddingTop = parseFloat(getComputedStyle(container).paddingTop) || 0;
  const paddingBottom = parseFloat(getComputedStyle(container).paddingBottom) || 0;

  const availableHeight =
    window.innerHeight -
    header.offsetHeight -
    controls.offsetHeight -
    suggestion.offsetHeight -
    paddingTop -
    paddingBottom;

  const size = Math.min(container.clientWidth, availableHeight);

  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  canvas.width = size;
  canvas.height = size;

  CELL_SIZE = canvas.width / (game.size + 1);
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const extra = 5; // padding around the outer stones
  const boardStart = CELL_SIZE / 2 - extra;
  const boardSize = CELL_SIZE * game.size + extra * 2;
  ctx.fillStyle = '#DDB06D';
  ctx.fillRect(boardStart, boardStart, boardSize, boardSize);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  for (let i = 0; i < game.size; i++) {
    ctx.beginPath();
    ctx.moveTo(CELL_SIZE, CELL_SIZE * (i + 1));
    ctx.lineTo(CELL_SIZE * game.size, CELL_SIZE * (i + 1));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CELL_SIZE * (i + 1), CELL_SIZE);
    ctx.lineTo(CELL_SIZE * (i + 1), CELL_SIZE * game.size);
    ctx.stroke();
  }

  // draw star points for 9x9
  const star = [
    [2, 2],
    [2, 6],
    [6, 2],
    [6, 6],
    [4, 4],
  ];
  for (const [x, y] of star) {
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.arc((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawStones();
  drawHoverStone();
}

function drawStones() {
  const size = CELL_SIZE - 4;
  for (let x = 0; x < game.size; x++) {
    for (let y = 0; y < game.size; y++) {
      if (game.board[x][y] !== 0) {
        const img = boardImages[x][y];
        if (img) {
          ctx.drawImage(
            img,
            (x + 1) * CELL_SIZE - size / 2,
            (y + 1) * CELL_SIZE - size / 2,
            size,
            size
          );
        } else {
          ctx.beginPath();
          ctx.fillStyle = game.board[x][y] === 1 ? '#000' : '#fff';
          ctx.arc(
            (x + 1) * CELL_SIZE,
            (y + 1) * CELL_SIZE,
            CELL_SIZE / 2 - 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }
}

function drawHoverStone() {
  if (!hoverPos) return;
  const { x, y } = hoverPos;
  if (x < 0 || x >= game.size || y < 0 || y >= game.size) return;
  if (game.board[x][y] !== 0) return;
  const size = CELL_SIZE - 4;
  if (!hoverImg) return;
  ctx.globalAlpha = 0.6;
  ctx.drawImage(
    hoverImg,
    (x + 1) * CELL_SIZE - size / 2,
    (y + 1) * CELL_SIZE - size / 2,
    size,
    size
  );
  ctx.globalAlpha = 1;
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left) / CELL_SIZE - 1);
  const y = Math.round((e.clientY - rect.top) / CELL_SIZE - 1);
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
    drawBoard();

    const boardStr = game.boardToString(game.board);
    fetch('/api/next-moves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board: boardStr }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('next moves', data);
      })
      .catch((err) => console.error(err));
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left) / CELL_SIZE - 1);
  const y = Math.round((e.clientY - rect.top) / CELL_SIZE - 1);
  const samePos = hoverPos && hoverPos.x === x && hoverPos.y === y;
  const needsNewImg =
    !samePos || hoverColor !== game.currentPlayer || hoverImg === null;
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
  drawBoard();
});

canvas.addEventListener('mouseleave', () => {
  hoverPos = null;
  hoverImg = null;
  drawBoard();
});

document.getElementById('back').addEventListener('click', () => {
  if (game.undo()) {
    boardImages = boardImagesHistory[game.currentIndex].map((row) => row.slice());
    drawBoard();
  }
});

document.getElementById('forward').addEventListener('click', () => {
  if (game.redo()) {
    boardImages = boardImagesHistory[game.currentIndex].map((row) => row.slice());
    drawBoard();
  }
});

document.getElementById('clear').addEventListener('click', () => {
  game.clear();
  boardImages = Array.from({ length: game.size }, () => Array(game.size).fill(null));
  boardImagesHistory = [boardImages.map((row) => row.slice())];
  hoverImg = null;
  drawBoard();
});

updateCanvasSize();
drawBoard();

window.addEventListener('resize', () => {
  updateCanvasSize();
  drawBoard();
});
