const movesCache = new Map();

function normalizeMoves(data) {
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const x = Number(item.x);
        const y = Number(item.y);
        const count = Number(item.count);
        if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isFinite(count)) {
          return null;
        }
        return { move: [x, y], count };
      })
      .filter(Boolean);
  }

  if (data && Array.isArray(data.moves)) {
    return data.moves
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        if (Array.isArray(item.move) && item.move.length === 2) {
          const [rawX, rawY] = item.move;
          const x = Number(rawX);
          const y = Number(rawY);
          const count = Number(item.count);
          if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isFinite(count)) {
            return null;
          }
          return { move: [x, y], count };
        }

        const x = Number(item.x);
        const y = Number(item.y);
        const count = Number(item.count);
        if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isFinite(count)) {
          return null;
        }
        return { move: [x, y], count };
      })
      .filter(Boolean);
  }

  console.warn("Unexpected response shape when normalizing moves", data);
  return [];
}

export async function fetchSuggestedMoves(game, setMoves, drawBoard) {
  const boardStr = game.boardToString(game.board);

  if (movesCache.has(boardStr)) {
    const cachedMoves = movesCache.get(boardStr);
    setMoves(cachedMoves);
    drawBoard();
    return;
  }

  try {
    const url = `/api/movecounts?board_str=${encodeURIComponent(boardStr)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const moves = normalizeMoves(data);
    movesCache.set(boardStr, moves);
    setMoves(moves);
    drawBoard();
  } catch (err) {
    console.error("Failed to fetch suggested moves", err);
  }
}
