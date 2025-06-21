let CELL_SIZE = 0;

export function getCellSize() {
  return CELL_SIZE;
}

export function updateCanvasSize(canvas, boardCanvas, game) {
  const container = canvas.parentElement;
  const header = document.querySelector(".banner");
  const controls = document.querySelector(".controls");
  const suggestion = document.getElementById("suggestion");

  const paddingTop = parseFloat(getComputedStyle(container).paddingTop) || 0;
  const paddingBottom =
    parseFloat(getComputedStyle(container).paddingBottom) || 0;

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
  boardCanvas.width = size;
  boardCanvas.height = size;

  CELL_SIZE = canvas.width / (game.size + 1);
}

export function drawBoardBackground(boardCtx, game) {
  boardCtx.clearRect(0, 0, boardCtx.canvas.width, boardCtx.canvas.height);
  const extra = 5; // padding around the outer stones
  const boardStart = CELL_SIZE / 2 - extra;
  const boardSize = CELL_SIZE * game.size + extra * 2;
  boardCtx.fillStyle = "#DDB06D";
  boardCtx.fillRect(boardStart, boardStart, boardSize, boardSize);
  boardCtx.strokeStyle = "#000";
  boardCtx.lineWidth = 1;
  for (let i = 0; i < game.size; i++) {
    boardCtx.beginPath();
    boardCtx.moveTo(CELL_SIZE, CELL_SIZE * (i + 1));
    boardCtx.lineTo(CELL_SIZE * game.size, CELL_SIZE * (i + 1));
    boardCtx.stroke();

    boardCtx.beginPath();
    boardCtx.moveTo(CELL_SIZE * (i + 1), CELL_SIZE);
    boardCtx.lineTo(CELL_SIZE * (i + 1), CELL_SIZE * game.size);
    boardCtx.stroke();
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
    boardCtx.beginPath();
    boardCtx.fillStyle = "#000";
    boardCtx.arc((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE, 3, 0, Math.PI * 2);
    boardCtx.fill();
  }
}

export function drawStones(ctx, boardImages, game) {
  const size = CELL_SIZE - 4;
  
  // Find the last played move by comparing current and previous board states
  let lastMovePos = null;
  if (game.currentIndex > 0 && game.history.length > 1) {
    const currentBoard = game.history[game.currentIndex];
    const prevBoard = game.history[game.currentIndex - 1];
    
    for (let x = 0; x < game.size; x++) {
      for (let y = 0; y < game.size; y++) {
        if (currentBoard[x][y] !== prevBoard[x][y] && currentBoard[x][y] !== 0) {
          lastMovePos = { x, y, color: currentBoard[x][y] };
          break;
        }
      }
      if (lastMovePos) break;
    }
  }
  
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
          ctx.fillStyle = game.board[x][y] === 1 ? "#000" : "#fff";
          ctx.arc(
            (x + 1) * CELL_SIZE,
            (y + 1) * CELL_SIZE,
            CELL_SIZE / 2 - 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        
        // Draw marker circle for last played move
        if (lastMovePos && x === lastMovePos.x && y === lastMovePos.y) {
          ctx.beginPath();
          ctx.strokeStyle = lastMovePos.color === 1 ? "#fff" : "#000";
          ctx.lineWidth = (CELL_SIZE / 2 - 2) * 0.15;
          const markerRadius = (CELL_SIZE / 2 - 2) * 0.6;
          ctx.arc(
            (x + 1) * CELL_SIZE,
            (y + 1) * CELL_SIZE,
            markerRadius,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      }
    }
  }
}

export function drawSuggestedMoves(ctx, suggestedMoves, game) {
  if (!suggestedMoves.length) return;
  const radius = CELL_SIZE / 2 - 2;
  const max = Math.max(...suggestedMoves.map((m) => m.count));
  const startColor = { r: 173, g: 216, b: 230 };
  const endColor = { r: 0, g: 0, b: 139 };
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${CELL_SIZE / 2}px Arial`;
  for (const { move, count } of suggestedMoves) {
    const [x, y] = move;
    if (game.board[x][y] !== 0) continue;
    const ratio = max === 0 ? 0 : count / max;
    const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
    const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
    const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = ratio > 0.5 ? "#fff" : "#000";
    ctx.fillText(count, (x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE);
  }
}

export function drawHoverStone(ctx, hoverPos, hoverImg, game) {
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

export function drawBoard(
  ctx,
  boardCanvas,
  boardImages,
  suggestedMoves,
  hoverPos,
  hoverImg,
  game
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(boardCanvas, 0, 0);
  drawStones(ctx, boardImages, game);
  drawSuggestedMoves(ctx, suggestedMoves, game);
  drawHoverStone(ctx, hoverPos, hoverImg, game);
}
