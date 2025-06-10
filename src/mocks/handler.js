import { rest } from "msw";

export const handlers = [
  rest.get("/api/next-moves", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ moves: [] }));
  }),
];
