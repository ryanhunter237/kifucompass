import { http, delay, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/movecounts", async ({ request }) => {
    const url = new URL(request.url);
    const board = url.searchParams.get("board_str") ?? "";
    const size = Math.sqrt(board.length);

    if (!Number.isInteger(size) || size <= 0) {
      return HttpResponse.json([]);
    }

    const candidates = [];
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (board[x * size + y] === "0") {
          candidates.push({
            x,
            y,
            count: Math.floor(Math.random() * 100),
          });
        }
      }
    }

    const maxMoves = Math.max(1, Math.floor(candidates.length / 2) || 1);
    const numMoves = Math.floor(Math.random() * maxMoves) + 1;
    const subset = candidates.sort(() => 0.5 - Math.random()).slice(0, numMoves);

    await delay();
    return HttpResponse.json(subset);
  }),
];
