const container = document.getElementById('gam2048');
const size = 4;
let board = [];

// ゲームの初期化
function initGame() {
  board = Array.from({ length: size }, () => Array(size).fill(0));
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
    // 90%の確率で2、10%の確率で4を生成
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
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
      cellDiv.className = `grid-cell ${value > 0 ? 'cell-' + value : ''}`;
      cellDiv.textContent = value > 0 ? value : '';
      rowDiv.appendChild(cellDiv);
    }
    container.appendChild(rowDiv);
  }
}

// 行（または列）のスライドと結合処理
function slide(row) {
  // 0を除外して詰める
  let newRow = row.filter(val => val !== 0);
  
  // 隣り合う同じ数字を結合
  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      newRow[i + 1] = 0;
    }
  }
  
  // 再度0を除外し、末尾に0を追加してサイズを4に合わせる
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
    
    // 方向に応じて行または列を抽出
    if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
      row = [...board[i]];
    } else {
      row = [board[0][i], board[1][i], board[2][i], board[3][i]];
    }

    // 右・下へ移動させる場合は配列を反転
    if (direction === 'ArrowRight' || direction === 'ArrowDown') {
      row.reverse();
    }

    // スライド処理の実行
    let newRow = slide(row);

    // 反転した配列を元に戻す
    if (direction === 'ArrowRight' || direction === 'ArrowDown') {
      newRow.reverse();
    }

    // 盤面に適用して変更があったか確認する
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

  // 盤面に変化があった場合のみタイルを追加
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
      // 空きマスがある場合は継続
      if (board[r][c] === 0) return;
      // 横に結合可能なマスがある場合は継続
      if (c < size - 1 && board[r][c] === board[r][c + 1]) return;
      // 縦に結合可能なマスがある場合は継続
      if (r < size - 1 && board[r][c] === board[r + 1][c]) return;
    }
  }
  setTimeout(() => alert('ゲームオーバー！'), 100);
}

// キーボード入力の監視
document.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault(); // 矢印キーでの画面スクロールを防止
    move(e.key);
  }
});

// ゲームの開始
initGame();