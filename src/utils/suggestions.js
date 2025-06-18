export function fetchSuggestedMoves(game, setMoves, drawBoard) {
  const boardStr = game.boardToString(game.board);
  return fetch("/api/next-moves", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board: boardStr }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data && Array.isArray(data.moves)) {
        setMoves(data.moves);
        drawBoard();
      }
    })
    .catch((err) => console.error(err));
}
