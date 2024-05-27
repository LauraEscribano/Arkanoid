// classes.js
const sonidoRebote = new Audio('./sonidos/sonidoRebote.wav');
const sonidoCorazon = new Audio('./sonidos/corazon.wav');
const sonidoBloqueRoto = new Audio('./sonidos/sonidoBloqueRoto.wav');

export class GameObject {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

export class Paddle extends GameObject {
    constructor(x, y, width, height, spriteSheet, spriteX, spriteY, spriteWidth, spriteHeight) {
        super(x, y, width, height, '');
        this.dx = 15;
        this.image = new Image();
        this.image.src = spriteSheet;
        this.spriteX = spriteX;
        this.spriteY = spriteY;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
    }

    move(direction, canvasWidth) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.dx;
        } else if (direction === 'right' && this.x + this.width < canvasWidth) {
            this.x += this.dx;
        }
    }

    draw(context) {
        if (this.image.complete && this.image.naturalHeight !== 0) {
            context.drawImage(
                this.image,
                this.spriteX, this.spriteY, this.spriteWidth, this.spriteHeight,
                this.x, this.y, this.width, this.height
            );
        } else {
            super.draw(context);
        }
    }
}

export class Ball extends GameObject {
    constructor(x, y, radius, color) {
        super(x, y, radius * 2, radius * 2, color);
        this.radius = radius;
        this.dx = 8;
        this.dy = -8;
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
    }

    update(canvasWidth, canvasHeight, paddle, bricks, onLoseLife, onBrickHit) {
        // Update position
        this.x += this.dx;
        this.y += this.dy;

        // Wall collision
        if (this.x + this.radius > canvasWidth || this.x - this.radius < 0) {
            this.dx = -this.dx;
            sonidoRebote.play();
        }
        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
            sonidoRebote.play();
        } else if (this.y + this.radius > canvasHeight) {
            onLoseLife();
            sonidoCorazon.play();
        }

        if (this.x + this.radius > paddle.x && this.x < paddle.x + paddle.width &&
            this.y + this.radius > paddle.y) {
            this.dy = -this.dy;
            sonidoRebote.play();
        }

        for (let row of bricks) {
            for (let brick of row) {
                if (!brick.destroyed &&
                    this.x + this.radius > brick.x && this.x < brick.x + brick.width &&
                    this.y + this.radius > brick.y && this.y < brick.y + brick.height) {
                    this.dy = -this.dy;
                    brick.hit();
                    sonidoRebote.play();
                    if (brick.destroyed) {
                        onBrickHit();
                        sonidoBloqueRoto.play();
                    }
                }
            }
        }
    }
}

export class Brick extends GameObject {
    constructor(x, y, width, height, color, hitsRequired ) {
        super(x, y, width, height, color);
        this.hitsRequired = hitsRequired;
        this.currentHits = 0;
        this.destroyed = false;
    }

    hit() {
        this.currentHits++;
        if (this.currentHits >= this.hitsRequired) {
            this.destroyed = true;
        } else {
            this.updateColor();
        }
    }

    updateColor() {
        // Aplica opacidad del 50% al color original
        const opacity = 0.6;
        const colorWithOpacity = this.hexToRgba(this.color, opacity);
        this.color = colorWithOpacity;
    }

    hexToRgba(hex, alpha) {
        const rgb = hex.replace('#', '').match(/.{2}/g).map((x) => parseInt(x, 16));
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }

    draw(context) {
        if (!this.destroyed) {
            super.draw(context);
        }
    }
}

export class BrickWall {
    constructor(rows, columns, brickWidth, brickHeight, padding, offsetX, offsetY, colors) {
        this.rows = rows;
        this.columns = columns;
        this.brickWidth = brickWidth;
        this.brickHeight = brickHeight;
        this.padding = padding;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.colors = colors;
        this.bricks = [];

        this.createWall();
    }

    createWall() {
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.columns; c++) {
                const x = this.offsetX + c * (this.brickWidth + this.padding);
                const y = this.offsetY + r * (this.brickHeight + this.padding);
                const color = this.colors[r % this.colors.length];
                const hitsRequired = r % 2 === 0 ? 1 : 2; // Alternar entre ladrillos de 1 y 2 golpes
                row.push(new Brick(x, y, this.brickWidth, this.brickHeight, color, hitsRequired));
            }
            this.bricks.push(row);
        }
    }

    draw(context) {
        for (const row of this.bricks) {
            for (const brick of row) {
                brick.draw(context);
            }
        }
    }
}