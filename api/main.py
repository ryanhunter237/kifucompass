from fastapi import FastAPI, Depends
from db import init_db, close_db, get_pool
import asyncpg
import numpy as np
from functools import partial
from hashlib import blake2b
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(lifespan=lifespan)


def compose(f, g):
    return lambda *args, **kwargs: f(g(*args, **kwargs))


BOARD_TRANSFORMS = {
    "ID": lambda x: x,
    "ROT_90": np.rot90,
    "ROT_180": partial(np.rot90, k=2),
    "ROT_270": partial(np.rot90, k=3),
    "FLIP_T_B": np.flipud,
    "FLIP_L_R": np.fliplr,
    "FLIP_TL_BR": compose(np.rot90, np.flipud),
    "FLIP_TR_BL": compose(np.rot90, np.fliplr),
}

INVERSE_MOVE_TRANSFORMS = {
    "ID": lambda x, y: (x, y),
    "ROT_90": lambda x, y: (y, 8 - x),
    "ROT_180": lambda x, y: (8 - x, 8 - y),
    "ROT_270": lambda x, y: (8 - y, x),
    "FLIP_T_B": lambda x, y: (8 - x, y),
    "FLIP_L_R": lambda x, y: (x, 8 - y),
    "FLIP_TL_BR": lambda x, y: (8 - y, 8 - x),
    "FLIP_TR_BL": lambda x, y: (y, x),
}


def lexicographical_comparison(board1: np.ndarray, board2: np.ndarray) -> int:
    assert board1.shape == board2.shape
    for a, b in zip(board1.reshape(-1), board2.reshape(-1)):
        if a < b:
            return -1
        if a > b:
            return 1
    return 0


def get_canonical_transform(board: np.ndarray) -> str:
    candidate_transform = "ID"
    board1 = board
    for key, transform_fn in BOARD_TRANSFORMS.items():
        # already set up candidates and board1 for "ID" transform outside loop
        if key == "ID":
            continue
        board2 = transform_fn(board)
        # keep the lexicographically smaller board
        lex_comp = lexicographical_comparison(board1, board2)
        if lex_comp > 0:  # board 2 is smaller
            candidate_transform = key
            board1 = board2
    return candidate_transform


# board_str should have 0 for empty spots, 1 for black stone, 2 for white stone
@app.get("/movecounts")
async def get_move_counts(board_str: str, pool: asyncpg.Pool = Depends(get_pool)):
    board = np.frombuffer(board_str.encode("ascii"), dtype=np.uint8) - ord("0")
    board = board.reshape((9, 9))
    key = get_canonical_transform(board)
    # need to copy transformed board to ensure it's a contiguous array in memory for hashing
    tfm_board = BOARD_TRANSFORMS[key](board).copy()
    # should I use tfm_board.tobytes() ?
    tfm_board_hash = blake2b(tfm_board.data, digest_size=8).digest()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT move_x, move_y, freq FROM move_counts where board_hash = $1",
            tfm_board_hash,
        )
        inv_move_transform = INVERSE_MOVE_TRANSFORMS[key]
        return [
            {
                "x": inv_move_transform(x, y)[0],
                "y": inv_move_transform(x, y)[1],
                "count": freq,
            }
            for x, y, freq in rows
        ]
