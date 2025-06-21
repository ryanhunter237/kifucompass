const movesCache = new Map();

export function fetchSuggestedMoves(game, setMoves, drawBoard) {
  const boardStr = game.boardToString(game.board);
  
  if (movesCache.has(boardStr)) {
    const cachedMoves = movesCache.get(boardStr);
    setMoves(cachedMoves);
    drawBoard();
    return Promise.resolve();
  }
  
  return fetch("/api/next-moves", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board: boardStr }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data && Array.isArray(data.moves)) {
        movesCache.set(boardStr, data.moves);
        setMoves(data.moves);
        drawBoard();
      }
    })
    .catch((err) => console.error(err));
}
