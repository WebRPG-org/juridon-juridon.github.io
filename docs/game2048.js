const container = document.getElementById('gam2048');
const size = 4;
let board = [];
let newTilePos = null; 
let mergedTilePositions = []; // 合体したタイルの位置を記録するぞ！

// ゲームの初期化
function initGame() {
  board = Array.from({ length: size }, () => Array(size).fill(0));
  newTilePos = null;
  mergedTilePositions = [];
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
    newTilePos = { r, c }; 
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
      
      // 新しく追加されたタイルのアニメーション
      if (newTilePos && newTilePos.r === r && newTilePos.c === c) {
        cellDiv.classList.add('cell-new');
      }
      
      // 合体したタイルのアニメーション
      if (mergedTilePositions.some(pos => pos.r === r && pos.c === c)) {
        cellDiv.classList.add('cell-merge');
      }

      cellDiv.textContent = value > 0 ? value : '';
      rowDiv.appendChild(cellDiv);
    }
    container.appendChild(rowDiv);
  }
}

// 行（または列）のスライドと合体判定
function slide(row) {
  let newRow = row.filter(val => val !== 0);
  let mergedIndices = []; // どのインデックスで合体したかメモするぜ
  
  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      newRow[i + 1] = 0;
      mergedIndices.push(i);
    }
  }
  
  let finalRow = [];
  let finalMergedIndices = [];
  let currentIndex = 0;

  for (let i = 0; i < newRow.length; i++) {
    if (newRow[i] !== 0) {
      finalRow.push(newRow[i]);
      // 空きを詰めた後の新しいインデックスを記録するぞ
      if (mergedIndices.includes(i)) {
        finalMergedIndices.push(currentIndex);
      }
      currentIndex++;
    }
  }

  while (finalRow.length < size) {
    finalRow.push(0);
  }
  return { row: finalRow, merged: finalMergedIndices };
}

// 各方向への移動処理
function move(direction) {
  let changed = false;
  let newBoard = Array.from({ length: size }, () => Array(size).fill(0));
  mergedTilePositions = []; // 動かすたびにリセットだ！

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

    // スライドと合体の結果を受け取る
    let slideResult = slide(row);
    let newRow = slideResult.row;
    let mergedIndices = slideResult.merged;

    if (direction === 'ArrowRight' || direction === 'ArrowDown') {
      newRow.reverse();
      // 反転した時は合体した場所のインデックスも逆から数え直すぞ
      mergedIndices = mergedIndices.map(idx => size - 1 - idx);
    }

    for (let j = 0; j < size; j++) {
      let oldVal = direction === 'ArrowLeft' || direction === 'ArrowRight' ? board[i][j] : board[j][i];
      let newVal = newRow[j];
      if (oldVal !== newVal) changed = true;

      let targetR = direction === 'ArrowLeft' || direction === 'ArrowRight' ? i : j;
      let targetC = direction === 'ArrowLeft' || direction === 'ArrowRight' ? j : i;

      newBoard[targetR][targetC] = newVal;

      // 合体した場所の座標を記録するぜ
      if (mergedIndices.includes(j)) {
        mergedTilePositions.push({ r: targetR, c: targetC });
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

// PC用：キーボード入力の監視
if (window.game2048Listener) {
  document.removeEventListener('keydown', window.game2048Listener);
}
window.game2048Listener = (e) => {
  if (e.repeat) return; 
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    move(e.key);
  }
};
document.addEventListener('keydown', window.game2048Listener);

// スマホ用：スワイプ入力の監視
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

container.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: false });

container.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });

container.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();
});

function handleSwipe() {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (Math.max(absDx, absDy) > 30) {
    if (absDx > absDy) {
      if (dx > 0) move('ArrowRight'); 
      else move('ArrowLeft');         
    } else {
      if (dy > 0) move('ArrowDown');  
      else move('ArrowUp');           
    }
  }
}

// ゲームの開始
initGame();
