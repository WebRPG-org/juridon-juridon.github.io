const container = document.getElementById('gam2048');
const size = 4;
let board = [];
let newTilePos = null; 
let mergedTilePositions = []; 
let isPlaying64Animation = false; // 演出中かどうかを管理するフラグだ！

// ゲームの初期化
function initGame() {
  board = Array.from({ length: size }, () => Array(size).fill(0));
  newTilePos = null;
  mergedTilePositions = [];
  isPlaying64Animation = false;
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
      
      if (newTilePos && newTilePos.r === r && newTilePos.c === c) {
        cellDiv.classList.add('cell-new');
      }
      
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
  let mergedIndices = []; 
  let created64 = false; // このスライドで64が生まれたか検知するぞ
  
  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      newRow[i + 1] = 0;
      if (newRow[i] === 64) created64 = true; // 64誕生！
      mergedIndices.push(i);
    }
  }
  
  let finalRow = [];
  let finalMergedIndices = [];
  let currentIndex = 0;

  for (let i = 0; i < newRow.length; i++) {
    if (newRow[i] !== 0) {
      finalRow.push(newRow[i]);
      if (mergedIndices.includes(i)) {
        finalMergedIndices.push(currentIndex);
      }
      currentIndex++;
    }
  }

  while (finalRow.length < size) {
    finalRow.push(0);
  }
  return { row: finalRow, merged: finalMergedIndices, created64: created64 };
}

// 各方向への移動処理
function move(direction) {
  if (isPlaying64Animation) return; // 演出中はすべての操作を完全に無視するぞ！

  let changed = false;
  let hasNew64 = false; // 今回の移動で64が新しくできたか
  let newBoard = Array.from({ length: size }, () => Array(size).fill(0));
  mergedTilePositions = []; 

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

    let slideResult = slide(row);
    let newRow = slideResult.row;
    let mergedIndices = slideResult.merged;
    if (slideResult.created64) hasNew64 = true; // 64のフラグを立てる

    if (direction === 'ArrowRight' || direction === 'ArrowDown') {
      newRow.reverse();
      mergedIndices = mergedIndices.map(idx => size - 1 - idx);
    }

    for (let j = 0; j < size; j++) {
      let oldVal = direction === 'ArrowLeft' || direction === 'ArrowRight' ? board[i][j] : board[j][i];
      let newVal = newRow[j];
      if (oldVal !== newVal) changed = true;

      let targetR = direction === 'ArrowLeft' || direction === 'ArrowRight' ? i : j;
      let targetC = direction === 'ArrowLeft' || direction === 'ArrowRight' ? j : i;

      newBoard[targetR][targetC] = newVal;

      if (mergedIndices.includes(j)) {
        mergedTilePositions.push({ r: targetR, c: targetC });
      }
    }
  }

  if (changed) {
    board = newBoard;
    
    // もし64が生まれていたら、特別な演出を発動させるぞ！
    if (hasNew64) {
      trigger64Animation();
    } else {
      // 通常の処理
      addRandomTile();
      renderBoard();
      checkGameOver();
    }
  }
}

// 🎮 話題の「64」合体カットイン演出の処理だ！
function trigger64Animation() {
  isPlaying64Animation = true; // 操作をロック！

  // 黒い背景のオーバーレイを作成
  const overlay = document.createElement('div');
  overlay.className = 'overlay-64';

  // フラッシュ用の真っ白な画面を作成
  const flash = document.createElement('div');
  flash.className = 'flash-screen';
  overlay.appendChild(flash);

  // 画面外から飛んでくる「6」
  const text6 = document.createElement('div');
  text6.className = 'n64-text shadow-3d-6 animate-6';
  text6.textContent = '6';
  overlay.appendChild(text6);

  // 画面外から飛んでくる「4」
  const text4 = document.createElement('div');
  text4.className = 'n64-text shadow-3d-4 animate-4';
  text4.textContent = '4';
  overlay.appendChild(text4);

  container.appendChild(overlay);

  // タイムラインの制御
  // 1. 0.7秒後（文字が中央で衝突した瞬間）
  setTimeout(() => {
    text6.remove();
    text4.remove();

    // 画面を真っ白にフラッシュさせる
    flash.classList.add('animate-flash');

    // 合体した巨大な「64」ロゴを出現させてポップアップさせる
    const logo64 = document.createElement('div');
    logo64.className = 'n64-text animate-logo';
    logo64.innerHTML = '<span class="shadow-3d-6">6</span><span class="shadow-3d-4">4</span>';
    overlay.appendChild(logo64);

    // 2. さらに1.2秒後（プレイヤーがロゴをじっくり拝んだ後）、フェードアウト開始
    setTimeout(() => {
      overlay.classList.add('animate-fadeout');

      // 3. さらに0.4秒後（フェードアウト完了）、演出終了してゲーム再開！
      setTimeout(() => {
        overlay.remove();
        isPlaying64Animation = false; // ロック解除！

        // 遅らせていた盤面の更新と次のタイルの生成を行うぞ
        addRandomTile();
        renderBoard();
        checkGameOver();
      }, 400);

    }, 1200);

  }, 700);
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
      else move('Up'); // move('ArrowUp')のタイポ修正
    }
  }
}
// タイポ修正用
function moveWrapper(dir) {
  if(dir === 'Up') move('ArrowUp');
  else move(dir);
}
// 念のためhandleSwipeの宛先を安全にするぜ
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
