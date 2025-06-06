import GoGame from './board.js';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="banner"><h1>Kifu Compass</h1></div>
  <div class="board-container">
    <canvas id="board"></canvas>
  </div>
  <div>
    <button id="undo">Back</button>
  </div>
  <div id="suggestion"></div>
`;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const game = new GoGame(9);

let CELL_SIZE;

function updateCanvasSize() {
  const container = canvas.parentElement;
  const header = document.querySelector('.banner');
  const undo = document.getElementById('undo');
  const suggestion = document.getElementById('suggestion');

  const paddingTop = parseFloat(getComputedStyle(container).paddingTop) || 0;
  const paddingBottom = parseFloat(getComputedStyle(container).paddingBottom) || 0;

  const availableHeight =
    window.innerHeight -
    header.offsetHeight -
    undo.offsetHeight -
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
let hoverPos = null;

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
  for (let x = 0; x < game.size; x++) {
    for (let y = 0; y < game.size; y++) {
      if (game.board[x][y] !== 0) {
        ctx.beginPath();
        ctx.fillStyle = game.board[x][y] === 1 ? '#000' : '#fff';
        ctx.strokeStyle = '#000';
        ctx.arc(
          (x + 1) * CELL_SIZE,
          (y + 1) * CELL_SIZE,
          CELL_SIZE / 2 - 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
      }
    }
  }
}

function drawHoverStone() {
  if (!hoverPos) return;
  const { x, y } = hoverPos;
  if (x < 0 || x >= game.size || y < 0 || y >= game.size) return;
  if (game.board[x][y] !== 0) return;

  ctx.beginPath();
  ctx.fillStyle = game.currentPlayer === 1 ? '#000' : '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.arc(
    (x + 1) * CELL_SIZE,
    (y + 1) * CELL_SIZE,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1;
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left) / CELL_SIZE - 1);
  const y = Math.round((e.clientY - rect.top) / CELL_SIZE - 1);
  if (game.attemptPlace(x, y)) {
    drawBoard();
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left) / CELL_SIZE - 1);
  const y = Math.round((e.clientY - rect.top) / CELL_SIZE - 1);
  hoverPos = { x, y };
  drawBoard();
});

canvas.addEventListener('mouseleave', () => {
  hoverPos = null;
  drawBoard();
});

document.getElementById('undo').addEventListener('click', () => {
  if (game.undo()) {
    drawBoard();
  }
});

updateCanvasSize();
drawBoard();

window.addEventListener('resize', () => {
  updateCanvasSize();
  drawBoard();
});
