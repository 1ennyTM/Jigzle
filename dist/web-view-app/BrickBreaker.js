import * as PIXI from 'pixi.js';
import 'pixi.js/unsafe-eval';
export class BrickBreaker {
    constructor(app) {
        this.stats = { wins: 0, losses: 0 };
        this.PADDLE_WIDTH = 100;
        this.PADDLE_HEIGHT = 20;
        this.BALL_RADIUS = 8;
        this.BRICK_WIDTH = 80;
        this.BRICK_HEIGHT = 15;
        this.BRICK_PADDING = 10;
        this.BRICK_ROWS = 4;
        this.BRICK_COLS = 10;
        this.app = app;
        this.gameContainer = new PIXI.Container();
        this.uiContainer = new PIXI.Container();
        this.confettiContainer = new PIXI.Container();
        this.app.stage.addChild(this.gameContainer);
        this.app.stage.addChild(this.uiContainer);
        this.app.stage.addChild(this.confettiContainer);
        this.paddle = new PIXI.Graphics();
        this.ball = new PIXI.Graphics();
        this.bricks = [];
        this.confettiParticles = [];
        this.gameStarted = false;
        this.isDragging = false;
        this.isTouchDevice = 'ontouchstart' in window;
        this.lives = 3;
        this.isGameOver = false;
        this.calculateDimensions();
        this.gameOverContainer = this.createGameOverScreen();
        this.winContainer = this.createWinScreen();
        this.app.stage.addChild(this.gameOverContainer);
        this.app.stage.addChild(this.winContainer);
        this.loadGameState();
        this.livesText = new PIXI.Text({
            text: 'Lives: 3',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xFFFFFF
            }
        });
        this.statsText = new PIXI.Text({
            text: this.getStatsText(),
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xFFFFFF
            }
        });
        this.ballSpeed = 5;
        this.ballDirX = 0;
        this.ballDirY = 0;
        this.initialize();
    }
    calculateDimensions() {
        const width = this.app.screen.width;
        const baseWidth = 756;
        const scale = width / baseWidth;
        this.PADDLE_WIDTH = Math.round(100 * scale);
        this.BALL_RADIUS = Math.round(8 * scale);
        if (width >= 756) {
            this.BRICK_COLS = 10;
            this.BRICK_PADDING = 10;
        }
        else if (width >= 400) {
            this.BRICK_COLS = 7;
            this.BRICK_PADDING = 8;
        }
        else if (width >= 343) {
            this.BRICK_COLS = 6;
            this.BRICK_PADDING = 6;
        }
        else {
            this.BRICK_COLS = 5;
            this.BRICK_PADDING = 5;
        }
        this.BRICK_WIDTH = (width - (this.BRICK_PADDING * (this.BRICK_COLS + 1))) / this.BRICK_COLS;
    }
    createGameOverScreen() {
        const container = new PIXI.Container();
        container.visible = false;
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, this.app.screen.width, this.app.screen.height)
            .fill({ color: 0x000000, alpha: 0.8 });
        const gameOverText = new PIXI.Text({
            text: 'Game Over',
            style: {
                fontFamily: 'Arial',
                fontSize: 32,
                fill: 0xFFFFFF
            }
        });
        gameOverText.x = this.app.screen.width / 2 - gameOverText.width / 2;
        gameOverText.y = this.app.screen.height / 2 - 50;
        const button = new PIXI.Graphics();
        button.roundRect(0, 0, 120, 40, 8)
            .fill({ color: 0x4CAF50 });
        button.x = this.app.screen.width / 2 - 60;
        button.y = this.app.screen.height / 2 + 10;
        const buttonText = new PIXI.Text({
            text: 'Retry',
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xFFFFFF
            }
        });
        buttonText.x = button.x + 60 - buttonText.width / 2;
        buttonText.y = button.y + 20 - buttonText.height / 2;
        button.eventMode = 'static';
        button.interactive = true;
        button.on('click', () => this.resetGame());
        container.addChild(bg, gameOverText, button, buttonText);
        return container;
    }
    createWinScreen() {
        const container = new PIXI.Container();
        container.visible = false;
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, this.app.screen.width, this.app.screen.height)
            .fill({ color: 0x000000, alpha: 0.8 });
        const winText = new PIXI.Text({
            text: 'YOU WON!',
            style: {
                fontFamily: 'Arial',
                fontSize: 48,
                fill: 0xFFD700,
                fontWeight: 'bold'
            }
        });
        winText.x = this.app.screen.width / 2 - winText.width / 2;
        winText.y = this.app.screen.height / 2 - 50;
        const button = new PIXI.Graphics();
        button.roundRect(0, 0, 160, 40, 8)
            .fill({ color: 0x4CAF50 });
        button.x = this.app.screen.width / 2 - 80;
        button.y = this.app.screen.height / 2 + 20;
        const buttonText = new PIXI.Text({
            text: 'Play Again',
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xFFFFFF
            }
        });
        buttonText.x = button.x + 80 - buttonText.width / 2;
        buttonText.y = button.y + 20 - buttonText.height / 2;
        button.eventMode = 'static';
        button.on('pointerdown', () => this.resetGame());
        container.addChild(bg, winText, button, buttonText);
        return container;
    }
    initialize() {
        console.log('Initializing game');
        this.createPaddle();
        this.createBall();
        this.createBricks();
        this.setupLivesDisplay();
        this.setupStats();
        this.setupEventListeners();
        this.startGameLoop();
    }
    setupLivesDisplay() {
        this.livesText.x = 10;
        this.livesText.y = 10;
        this.uiContainer.addChild(this.livesText);
        this.updateLivesDisplay();
    }
    setupStats() {
        this.statsText.x = this.app.screen.width - 150;
        this.statsText.y = 10;
        this.uiContainer.addChild(this.statsText);
    }
    updateLivesDisplay() {
        this.livesText.text = `Lives: ${this.lives}`;
    }
    createPaddle() {
        this.paddle = new PIXI.Graphics();
        this.paddle
            .rect(0, 0, this.PADDLE_WIDTH, this.PADDLE_HEIGHT)
            .fill({ color: 0xFFFFFF });
        this.paddle.x = this.app.screen.width / 2 - this.PADDLE_WIDTH / 2;
        this.paddle.y = this.app.screen.height - 40;
        this.gameContainer.addChild(this.paddle);
    }
    createBall() {
        this.ball = new PIXI.Graphics();
        this.ball
            .circle(0, 0, this.BALL_RADIUS)
            .fill({ color: 0xFFFFFF });
        this.resetBall();
        this.gameContainer.addChild(this.ball);
    }
    createBricks() {
        const colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00];
        this.bricks = [];
        for (let row = 0; row < this.BRICK_ROWS; row++) {
            for (let col = 0; col < this.BRICK_COLS; col++) {
                const brick = new PIXI.Graphics();
                brick
                    .rect(0, 0, this.BRICK_WIDTH, this.BRICK_HEIGHT)
                    .fill(colors[row]);
                brick.x = col * (this.BRICK_WIDTH + this.BRICK_PADDING) + this.BRICK_PADDING;
                brick.y = row * (this.BRICK_HEIGHT + this.BRICK_PADDING) + this.BRICK_PADDING + 50;
                brick.visible = true;
                brick.row = row;
                brick.col = col;
                this.bricks.push(brick);
                this.gameContainer.addChild(brick);
            }
        }
    }
    createConfetti() {
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
        for (let i = 0; i < 100; i++) {
            const particle = new PIXI.Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle
                .clear()
                .fill({ color: color, alpha: 0.8 })
                .rect(0, 0, 6, 6);
            particle.x = Math.random() * this.app.screen.width;
            particle.y = -10;
            particle.vx = (Math.random() - 0.5) * 10;
            particle.vy = Math.random() * 5 + 2;
            particle.rotation = Math.random() * Math.PI * 2;
            particle.rotationSpeed = (Math.random() - 0.5) * 0.2;
            this.confettiParticles.push(particle);
            this.confettiContainer.addChild(particle);
        }
    }
    updateConfetti() {
        for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
            const particle = this.confettiParticles[i];
            if (particle) {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.rotation += particle.rotationSpeed;
                if (particle.y > this.app.screen.height + 10) {
                    this.confettiContainer.removeChild(particle);
                    this.confettiParticles.splice(i, 1);
                }
            }
        }
        if (this.confettiParticles.length < 50 && this.winContainer.visible) {
            this.createConfetti();
        }
    }
    resetBall() {
        this.ball.x = this.app.screen.width / 2;
        this.ball.y = this.app.screen.height - 60;
        this.gameStarted = false;
        this.ballDirX = 0;
        this.ballDirY = 0;
    }
    getRelativeX(event) {
        const rect = this.app.canvas.getBoundingClientRect();
        const clientX = 'touches' in event ? event.touches[0]?.clientX : event.clientX;
        return (clientX || 0) - rect.left;
    }
    movePaddle(x) {
        this.paddle.x = Math.max(0, Math.min(this.app.screen.width - this.PADDLE_WIDTH, x - this.PADDLE_WIDTH / 2));
        if (!this.gameStarted) {
            this.ball.x = this.paddle.x + this.PADDLE_WIDTH / 2;
        }
    }
    setupEventListeners() {
        window.addEventListener('message', (e) => {
            const eventPayload = e.data;
            if (eventPayload.type === 'devvit-message') {
                console.log('message received from devvit', eventPayload);
                var message = eventPayload.data.message || {};
                if (message.type == 'startGame') {
                    this.stats = message.data || { wins: 0, losses: 0 };
                    console.log(this.stats);
                    this.statsText.text = this.getStatsText();
                }
            }
        });
        if (this.isTouchDevice) {
            this.app.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.isDragging = true;
                this.movePaddle(this.getRelativeX(e));
                if (!this.gameStarted) {
                    this.gameStarted = true;
                    this.ballDirX = Math.random() * 2 - 1;
                    this.ballDirY = -1;
                }
            });
            this.app.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (this.isDragging) {
                    this.movePaddle(this.getRelativeX(e));
                }
            });
            this.app.canvas.addEventListener('touchend', () => {
                this.isDragging = false;
            });
            this.app.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });
        }
        else {
            this.app.canvas.addEventListener('pointermove', (e) => {
                this.movePaddle(this.getRelativeX(e));
            });
            this.app.canvas.addEventListener('pointerdown', () => {
                if (!this.gameStarted) {
                    this.gameStarted = true;
                    this.ballDirX = Math.random() * 2 - 1;
                    this.ballDirY = -1;
                }
            });
        }
    }
    saveStats() {
        let message = {
            type: 'saveEmblem',
            data: this.stats
        };
        window.parent?.postMessage(message, '*');
    }
    getStatsText() {
        return `Wins: ${this.stats.wins} | Losses: ${this.stats.losses}`;
    }
    update(ticker) {
        if (this.isGameOver || (!this.gameStarted && !this.winContainer.visible))
            return;
        if (this.winContainer.visible) {
            this.updateConfetti();
            return;
        }
        if (this.gameStarted) {
            const speed = this.ballSpeed * ticker.deltaTime;
            // Move ball
            this.ball.x += this.ballDirX * speed;
            this.ball.y += this.ballDirY * speed;
            // Ball collision with walls
            if (this.ball.x <= this.BALL_RADIUS ||
                this.ball.x >= this.app.screen.width - this.BALL_RADIUS) {
                this.ballDirX *= -1;
            }
            if (this.ball.y <= this.BALL_RADIUS) {
                this.ballDirY *= -1;
            }
            // Ball collision with paddle
            if (this.ball.y + this.BALL_RADIUS >= this.paddle.y &&
                this.ball.y - this.BALL_RADIUS <= this.paddle.y + this.PADDLE_HEIGHT &&
                this.ball.x >= this.paddle.x &&
                this.ball.x <= this.paddle.x + this.PADDLE_WIDTH) {
                this.ballDirY = -1;
                const paddleCenter = this.paddle.x + this.PADDLE_WIDTH / 2;
                const hitPoint = (this.ball.x - paddleCenter) / (this.PADDLE_WIDTH / 2);
                this.ballDirX = hitPoint * 1.5;
            }
            // Ball out of bounds
            if (this.ball.y >= this.app.screen.height) {
                this.lives--;
                this.updateLivesDisplay();
                this.saveGameState();
                if (this.lives <= 0) {
                    this.gameOver();
                }
                else {
                    this.resetBall();
                }
            }
            // Ball collision with bricks
            this.bricks.forEach((brick) => {
                if (brick.visible &&
                    this.ball.x + this.BALL_RADIUS >= brick.x &&
                    this.ball.x - this.BALL_RADIUS <= brick.x + this.BRICK_WIDTH &&
                    this.ball.y + this.BALL_RADIUS >= brick.y &&
                    this.ball.y - this.BALL_RADIUS <= brick.y + this.BRICK_HEIGHT) {
                    brick.visible = false;
                    this.ballDirY *= -1;
                }
            });
            if (this.checkWinCondition()) {
                this.handleWin();
            }
        }
    }
    startGameLoop() {
        console.log('Starting game loop');
        this.applyBrickState();
        this.app.ticker.add(this.update, this);
    }
    loadGameState() {
        const savedState = localStorage.getItem('brickBreakerState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            this.lives = gameState.lives;
            this.savedBrickState = gameState.bricks;
        }
    }
    applyBrickState() {
        if (this.savedBrickState) {
            this.savedBrickState.forEach((savedBrick) => {
                const brick = this.bricks.find(b => b.y === savedBrick.row && b.x === savedBrick.col);
                if (brick) {
                    brick.visible = savedBrick.visible;
                }
            });
            this.savedBrickState = undefined;
        }
    }
    saveGameState() {
        const gameState = {
            lives: this.lives,
            bricks: this.bricks.map(brick => ({
                row: brick.y,
                col: brick.x,
                visible: brick.visible
            }))
        };
        localStorage.setItem('brickBreakerState', JSON.stringify(gameState));
    }
    resetGame() {
        console.log('Resetting game');
        this.lives = 3;
        this.isGameOver = false;
        this.gameOverContainer.visible = false;
        this.winContainer.visible = false;
        this.toggleGameVisibility(true);
        // Clear containers
        while (this.gameContainer.children.length > 0) {
            this.gameContainer.removeChildAt(0);
        }
        while (this.uiContainer.children.length > 0) {
            this.uiContainer.removeChildAt(0);
        }
        while (this.confettiContainer.children.length > 0) {
            this.confettiContainer.removeChildAt(0);
        }
        this.confettiParticles = [];
        this.bricks = [];
        localStorage.removeItem('brickBreakerState');
        this.initialize();
    }
    toggleGameVisibility(visible) {
        this.gameContainer.visible = visible;
        this.uiContainer.visible = visible;
    }
    checkWinCondition() {
        return this.bricks.every(brick => !brick.visible);
    }
    handleWin() {
        this.stats.wins++;
        this.saveStats();
        this.statsText.text = this.getStatsText();
        this.toggleGameVisibility(false);
        this.winContainer.visible = true;
        this.createConfetti();
        this.app.ticker.remove(this.update, this);
    }
    gameOver() {
        this.isGameOver = true;
        this.stats.losses++;
        this.saveStats();
        this.statsText.text = this.getStatsText();
        this.toggleGameVisibility(false);
        this.gameOverContainer.visible = true;
        localStorage.removeItem('brickBreakerState');
        this.app.ticker.remove(this.update, this);
    }
}
//# sourceMappingURL=BrickBreaker.js.map