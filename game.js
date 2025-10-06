// =================================================================
// 敵車クラスの定義
// =================================================================

class OpponentCar {
    constructor(x, y, speed, color = 'red') {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 50;
        this.speed = speed;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        // X, Y は左上隅の座標として描画
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update(canvasHeight) {
        this.y += this.speed;
        // 画面外に出たら true を返す
        return this.y > canvasHeight;
    }

    checkCollision(player) {
        // プレイヤーオブジェクト (x, y, width, height) との AABB 衝突判定
        return (
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y
        );
    }
}


// =================================================================
// ゲームのセットアップとメインロジック
// =================================================================

// キャンバス要素と描画コンテキストを取得
const canvas = document.getElementById('gameArea');
const ctx = canvas.getContext('2d');

// リトライボタン要素を取得
const retryButton = document.getElementById('retryButton');

// プレイヤー車の初期設定（座標は左上隅を基準）
let player = {
    width: 30,
    height: 50,
    x: canvas.width / 2 - 15, 
    y: canvas.height - 70,    
    speed: 5
};

// ゲームの状態管理変数
let keys = {};      // 押されているキーを追跡
let opponents = []; // 敵車のインスタンスを格納
let gameRunning = true; // ゲーム実行状態
let score = 0;      // スコア

// 敵車の生成設定
let spawnTimer = 0;
const spawnInterval = 100; // 敵車を生成する頻度 (フレーム数)

// 道路の定数
const ROAD_LEFT = canvas.width / 4;
const ROAD_RIGHT = canvas.width * 3 / 4;
const ROAD_WIDTH = ROAD_RIGHT - ROAD_LEFT;


// -------------------- ボタン制御 --------------------

function showRetryButton() {
    // 画面中央に配置するため、絶対位置指定されている前提
    if (retryButton) {
        retryButton.style.display = 'block';
    }
}

function hideRetryButton() {
    if (retryButton) {
        retryButton.style.display = 'none';
    }
}

// リトライボタンにクリックイベントを設定
if (retryButton) {
    retryButton.addEventListener('click', () => {
        resetGame();
    });
}


// -------------------- キー入力 --------------------

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});


// -------------------- ゲームリセット --------------------

/**
 * ゲームの状態を初期値にリセットし、リトライボタンを隠します。
 */
function resetGame() {
    // 1. プレイヤーの位置をリセット
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 70;
    
    // 2. 敵車をすべてクリア
    opponents = [];
    
    // 3. スコアとタイマーをリセット
    score = 0;
    spawnTimer = 0;
    
    // 4. ゲーム状態を「実行中」に戻す
    gameRunning = true;
    
    // 5. リトライボタンを非表示にする
    hideRetryButton();
}


// -------------------- 敵車の生成 --------------------

function spawnOpponent() {
    // 敵車のランダムなX座標を計算 (道路内)
    // -30 は車の幅の調整
    const randomX = ROAD_LEFT + Math.random() * (ROAD_WIDTH - 30); 

    // 2.5〜5.5 のランダムな速度
    const carSpeed = 2.5 + Math.random() * 3; 

    // Y座標をキャンバスの上端外側 (-50) からスタート
    opponents.push(new OpponentCar(randomX, -50, carSpeed)); 
}


// -------------------- 更新関数 --------------------

function update() {
    if (!gameRunning) return; // ゲームオーバーなら更新しない

    // 1. プレイヤーの移動処理
    if (keys['ArrowLeft'] || keys['a']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.x += player.speed;
    }
    
    // 画面外に出ないように制限 (道路の範囲内)
    // 道路左側の境界
    player.x = Math.max(ROAD_LEFT, player.x);
    // 道路右側の境界
    player.x = Math.min(ROAD_RIGHT - player.width, player.x);

    // 2. 敵車の生成
    spawnTimer++;
    if (spawnTimer >= spawnInterval) {
        spawnOpponent();
        spawnTimer = 0;
    }

    // 3. 敵車の更新、衝突判定、画面外に出た車の除去
    for (let i = opponents.length - 1; i >= 0; i--) {
        let car = opponents[i];

        // 敵車を下に移動
        const isOffScreen = car.update(canvas.height);

        // 衝突判定
        if (car.checkCollision(player)) {
            if (gameRunning) { // 衝突した瞬間に一度だけ実行
                gameRunning = false; // ゲームオーバーフラグを立てる
                console.log('衝突！ゲームオーバー');
                showRetryButton(); // リトライボタンを表示
            }
            return; // 衝突したら更新を中断
        }

        // 画面外に出た車を配列から削除
        if (isOffScreen) {
            opponents.splice(i, 1);
            score += 10; // スコア加算
        }
    }
}


// -------------------- 描画関数 --------------------

function draw() {
    // 1. キャンバス全体をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. 道路を描画
    ctx.fillStyle = 'gray';
    ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, canvas.height);
    
    // 道路の縁を描画 (白線)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(ROAD_LEFT, 0);
    ctx.lineTo(ROAD_LEFT, canvas.height);
    ctx.moveTo(ROAD_RIGHT, 0);
    ctx.lineTo(ROAD_RIGHT, canvas.height);
    ctx.stroke();

    // 3. 敵車を描画
    opponents.forEach(car => {
        car.draw(ctx);
    });

    // 4. プレイヤーの車を描画
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 5. スコアの表示
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    
    // 6. ゲームオーバーメッセージの表示
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
    }
}


// -------------------- ゲームループ --------------------

function gameLoop() {
    update();
    draw();

    // 次のフレームで再度実行
    requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop();