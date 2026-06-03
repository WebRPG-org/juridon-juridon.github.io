const container = document.getElementById('gam2048');
const size = 4;
let board = [];
let newTilePos = null; // 新しいタイルの位置を記録する変数を追加！

// ゲームの初期化
function initGame() {
  board = Array.from({ length: size }, () => Array(size).fill(0));
  newTilePos = null;
  addRandomTile();
  addRandomTile();
  renderBoard();
}

// 空きマスに2か4をランダムに追加
function addRandomTile() {
  let emptyCells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length > 0) {
    let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
    newTilePos = { r, c }; // 追加した場所を記録！
  }
}

// 画面の描画
function renderBoard() {
  container.innerHTML = '';
  for (let r = 0; r < size; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'grid-row';
    for (let c = 0; c < size; c++) {
      const cellDiv = document.createElement('div');
      const value = board[r][c];
      
      // 基本のクラス
      cellDiv.className = `grid-cell ${value > 0 ? 'cell-' + value : ''}`;
      
      // 新しく追加されたタイルならアニメーション用クラスを付ける！
      if (newTilePos && newTilePos.r === r && newTilePos.c === c) {
        cellDiv.classList.add('cell-new');
      }

      cellDiv.textContent = value > 0 ? value : '';
      rowDiv.appendChild(cellDiv);
    }
    container.appendChild(rowDiv);
  }
}

// 行（または列）のスライドと結合処理
function slide(row) {
  let newRow = row.filter(val => val !== 0);
  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      newRow[i + 1] = 0;
    }
  }
  newRow = newRow.filter(val => val !== 0);
  while (newRow.length < size) {
    newRow.push(0);
  }
  return newRow;
}

// 各方向への移動処理
function move(direction) {
  let changed = false;
  let newBoard = Array.from({ length: size }, () => Array(size).fill(0));

  for (let i = 0; i < size; i++) {
    let row = [];
    if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
      row = [...board[i]];
    } else {
      row = [board[0][i], board[1][i], board[2][i], board[3][i]];
    }

    if (direction === 'ArrowRight' || direction === 'ArrowDown') {
      row.reverse();
    }

    let newRow = slide(row);

    if (direction === 'ArrowRight' || direction === 'ArrowDown') {
      newRow.reverse();
    }

    for (let j = 0; j < size; j++) {
      let oldVal = direction === 'ArrowLeft' || direction === 'ArrowRight' ? board[i][j] : board[j][i];
      let newVal = newRow[j];
      if (oldVal !== newVal) changed = true;

      if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
        newBoard[i][j] = newVal;
      } else {
        newBoard[j][i] = newVal;
      }
    }
  }

  if (changed) {
    board = newBoard;
    addRandomTile();
    renderBoard();
    checkGameOver();
  }
}

// ゲームオーバー判定
function checkGameOver() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) return;
      if (c < size - 1 && board[r][c] === board[r][c + 1]) return;
      if (r < size - 1 && board[r][c] === board[r + 1][c]) return;
    }
  }
  setTimeout(() => alert('ゲームオーバー！'), 100);
}

// キーボード入力の監視（修正箇所）
// 何度もファイルを読み込んでもイベントが重複しないようにする工夫
if (window.game2048Listener) {
  document.removeEventListener('keydown', window.game2048Listener);
}
window.game2048Listener = (e) => {
  if (e.repeat) return; // ←ここでキーの長押しによる連続発火をストップ！
  
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    move(e.key);
  }
};
document.addEventListener('keydown', window.game2048Listener);

// ゲームの開始
initGame();
