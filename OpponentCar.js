// OpponentCar.js

/**
 * 敵車（障害物）を表現するクラス
 */
class OpponentCar {
    /**
     * @param {number} x - 初期X座標
     * @param {number} y - 初期Y座標 (通常はキャンバスの上端外側)
     * @param {number} speed - 敵車が画面を流れる速度
     * @param {string} color - 描画色
     */
    constructor(x, y, speed, color = 'red') {
        this.x = x;
        this.y = y;
        this.width = 30;  // プレイヤー車と同じか近いサイズ
        this.height = 50;
        this.speed = speed;
        this.color = color;
    }

    /**
     * 敵車をキャンバスに描画します。
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        // 座標は中心ではなく、左上隅を基準に描画します
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // ※もし画像を使う場合は、以下のように変更します:
        // ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    /**
     * 敵車を下に移動させ、画面外に出たかどうかを判定します。
     * @param {number} canvasHeight - キャンバスの高さ
     * @returns {boolean} - 画面外に出たら true
     */
    update(canvasHeight) {
        this.y += this.speed;

        // 画面の下端を超えたかどうか
        return this.y > canvasHeight;
    }

    /**
     * プレイヤーとの衝突判定を行います。
     * @param {object} player - プレイヤー車（x, y, width, height プロパティを持つオブジェクト）
     * @returns {boolean} - 衝突していれば true
     */
    checkCollision(player) {
        // 衝突判定は、二つの四角形が重なっているかどうかで判断します
        return (
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y
        );
    }
}

// 他のJavaScriptファイルで使用するためにエクスポートする場合 (通常は不要ですが、モジュールを使う場合に備えて)
// export default OpponentCar;