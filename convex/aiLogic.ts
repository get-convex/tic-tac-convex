export function getAvailableMoves(board: Array<"X" | "O" | null>): number[] {
  return board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);
}

export function findWinningMove(
  board: Array<"X" | "O" | null>,
  symbol: "X" | "O"
): number | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (const [a, b, c] of lines) {
    const cells = [board[a], board[b], board[c]];
    const symbolCount = cells.filter((cell) => cell === symbol).length;
    const nullCount = cells.filter((cell) => cell === null).length;

    if (symbolCount === 2 && nullCount === 1) {
      const emptyIndex = [a, b, c][cells.findIndex((cell) => cell === null)];
      return emptyIndex;
    }
  }

  return null;
}

export function getBestMove(
  board: Array<"X" | "O" | null>,
  aiSymbol: "X" | "O"
): number {
  const opponentSymbol = aiSymbol === "X" ? "O" : "X";

  // Try to win
  const winningMove = findWinningMove(board, aiSymbol);
  if (winningMove !== null) return winningMove;

  // Block opponent from winning
  const blockingMove = findWinningMove(board, opponentSymbol);
  if (blockingMove !== null) return blockingMove;

  // Take center if available
  if (board[4] === null) return 4;

  // Take corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((i) => board[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[
      Math.floor(Math.random() * availableCorners.length)
    ];
  }

  // Take any available move
  const availableMoves = getAvailableMoves(board);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}
