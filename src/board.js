class GoGame {
  constructor(size = 9) {
    this.size = size;
    this.board = Array.from({ length: size }, () => Array(size).fill(0));
    this.currentPlayer = 1; // 1 = black, 2 = white
    this.history = [this.cloneBoard(this.board)];
  }

  cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  boardToString(board) {
    return board.flat().join('');
  }

  isOnBoard(x, y) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  getAdjacent(x, y) {
    return [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ].filter((p) => this.isOnBoard(p.x, p.y));
  }

  getGroup(x, y, board = this.board, visited = new Set()) {
    const color = board[x][y];
    if (color === 0) return [];
    const key = (a, b) => `${a},${b}`;
    const stack = [[x, y]];
    visited.add(key(x, y));
    const group = [];
    while (stack.length) {
      const [cx, cy] = stack.pop();
      group.push([cx, cy]);
      for (const p of this.getAdjacent(cx, cy)) {
        if (board[p.x][p.y] === color && !visited.has(key(p.x, p.y))) {
          visited.add(key(p.x, p.y));
          stack.push([p.x, p.y]);
        }
      }
    }
    return group;
  }

  getLiberties(group, board = this.board) {
    const seen = new Set();
    let count = 0;
    const key = (a, b) => `${a},${b}`;
    for (const [x, y] of group) {
      for (const p of this.getAdjacent(x, y)) {
        if (board[p.x][p.y] === 0 && !seen.has(key(p.x, p.y))) {
          seen.add(key(p.x, p.y));
          count += 1;
        }
      }
    }
    return count;
  }

  attemptPlace(x, y) {
    if (!this.isOnBoard(x, y) || this.board[x][y] !== 0) return false;
    const color = this.currentPlayer;
    const opp = color === 1 ? 2 : 1;

    let newBoard = this.cloneBoard(this.board);
    newBoard[x][y] = color;

    // Capture opponent groups
    for (const p of this.getAdjacent(x, y)) {
      if (newBoard[p.x][p.y] === opp) {
        const group = this.getGroup(p.x, p.y, newBoard);
        if (this.getLiberties(group, newBoard) === 0) {
          for (const [gx, gy] of group) newBoard[gx][gy] = 0;
        }
      }
    }

    // Suicide check
    const group = this.getGroup(x, y, newBoard);
    if (this.getLiberties(group, newBoard) === 0) {
      return false;
    }

    // Ko check
    if (this.history.length >= 2) {
      const prevStr = this.boardToString(this.history[this.history.length - 2]);
      if (prevStr === this.boardToString(newBoard)) return false;
    }

    this.board = newBoard;
    this.history.push(this.cloneBoard(this.board));
    this.currentPlayer = opp;
    return true;
  }

  undo() {
    if (this.history.length <= 1) return false;
    this.history.pop();
    this.board = this.cloneBoard(this.history[this.history.length - 1]);
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    return true;
  }
}

export default GoGame;
