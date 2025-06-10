import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/next-moves", async ({ request }) => {
    const { board } = await request.json();
    const size = Math.sqrt(board.length);
    const moves = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i * size + j] === "0") {
          moves.push({
            move: [i, j],
            count: Math.floor(Math.random() * 100),
          });
        }
      }
    }

    const maxMoves = Math.max(1, Math.floor(moves.length / 2));
    const numMoves = Math.floor(Math.random() * maxMoves) + 1;
    const subset = moves.sort(() => 0.5 - Math.random()).slice(0, numMoves);

    return HttpResponse.json({ moves: subset });
  }),
];
