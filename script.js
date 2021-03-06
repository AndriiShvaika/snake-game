//Set up canvas
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

//Get the width and height from the canvas element
const width = canvas.width
const height = canvas.height

//Work out the width and height in blocks
const blockSize = 10
const widthInBlocks = width / blockSize
const heightInBlocks = height / blockSize

// Set score to 0
let score = 0

// Draw the border
drawBorder = function () {
    ctx.fillStyle = 'Gray'
    ctx.fillRect(0, 0, width, blockSize)
    ctx.fillRect(0, height - blockSize, width, blockSize)
    ctx.fillRect(0, 0, blockSize, height)
    ctx.fillRect(width - blockSize, 0, blockSize, height)
}

// Draw the score in the top-left corner
drawScore = function () {
    ctx.font = '20px Courier'
    ctx.fillStyle = 'Black'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('Score: ' + score, blockSize, blockSize)
}

// Clear the interval and display Game Over text
gameOver = function () {
    playing = false
    ctx.font = '45px Courier'
    ctx.fillStyle = 'Black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Game Over', width / 2, height / 2)
}

// Draw a circle
circle = function (x, y, radius, fillCircle) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2, false)
    if (fillCircle) {
        ctx.fill()
    } else {
        ctx.stroke()
    }
}

// The Block constructor
class Block {
    constructor(col, row) {
        this.col = col
        this.row = row
    }
}

//Draw a square at the block's location
Block.prototype.drawSquare = function (color) {
    const x = this.col * blockSize
    const y = this.row * blockSize
    ctx.fillStyle = color
    ctx.fillRect(x, y, blockSize, blockSize)
}

// Draw a circle at the block's location
Block.prototype.drawCircle = function (color) {
    const centerX = this.col * blockSize + blockSize / 2
    const centerY = this.row * blockSize + blockSize / 2
    ctx.fillStyle = color
    circle(centerX, centerY, blockSize / 2, true)
}

// Check if this block is the same location as another block
Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row
}

// The Snake constructor
class Snake {
    constructor() {
        this.segments = [
            new Block(7, 5),
            new Block(6, 5),
            new Block(5, 5)
        ]
    this.direction = 'right'
    this.nextDirection = 'right'
    }
}

// Draw a square for each segment of the snake's body
Snake.prototype.draw = function() {
    for (let i = 0; i < this.segments.length; i++) {
        if (i === 0) {
            this.segments[i].drawSquare('Black')
        } else if (i % 2 === 0) {
            this.segments[i].drawSquare('FireBrick')
        } else {
            this.segments[i].drawSquare('LightSlateGrey')
        }
    }
}

// Create a new head and add it to the beginning of
// the snake to move the snake in its current direction
Snake.prototype.move = function () {
    const head = this.segments[0]
    let newHead

    this.direction = this.nextDirection

    if (this.direction === 'right') {
        newHead = new Block(head.col + 1, head.row)
    } else if (this.direction === 'down') {
        newHead = new Block(head.col, head.row + 1)
    } else if (this.direction === 'left') {
        newHead = new Block(head.col - 1, head.row)
    } else if (this.direction === 'up') {
        newHead = new Block(head.col, head.row - 1)
    }

    if (this.checkCollision(newHead)) {
        gameOver()
        return
    }
    this.segments.unshift(newHead)

    if (newHead.equal(apple.position)) {
        score++
        animationTime--
        apple.move(this.segments);
    } else {
        this.segments.pop()
    }
}

// Check if snake's new head has collided with the wall of itself
Snake.prototype.checkCollision = function (head) {
    const leftCollision = (head.col === 0)
    const topCollision = (head.row === 0)
    const rightCollision = (head.col === widthInBlocks - 1)
    const bottomCollision = (head.row === heightInBlocks - 1)

    const wallCollision = leftCollision || topCollision || rightCollision || bottomCollision

    const selfCollision = false

    for (let i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true
        }
    }

    return wallCollision || selfCollision
}

// Set the snake's next direction based on the keyboard
Snake.prototype.setDirection = function (newDirection) {
    if (this.direction === 'up' && newDirection === 'down') {
        return
    } else if (this.direction === 'right' && newDirection === 'left') {
        return
    } else if (this.direction === 'down' && newDirection === 'up') {
        return
    } else if (this.direction === 'left' && newDirection === 'right') {
        return
    }

    this.nextDirection = newDirection
}

// The Apple constructor
class Apple {
    constructor() {
        this.position = new Block(10, 10)
    }
}

// Draw a circle at the apple's location
Apple.prototype.draw = function () {
    this.position.drawCircle('Crimson')
}

// Move the apple to a new random location
Apple.prototype.move = function (occupiedBlocks) {
    const randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1
    const randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1
    this.position = new Block(randomCol, randomRow)

    // Check to see if apple has been moved to a block currently occupied by the snake
    for (let i = 0; i < occupiedBlocks.length; i++) {
        if (this.position.equal(occupiedBlocks[i])) {
            this.move(occupiedBlocks) // Call the move method again
            return
        }
    }
}

// Create the snake and apple objects
const snake = new Snake()
const apple = new Apple()

let playing = true
let animationTime = 90

// Create a game loop function, which will call itself using setTimeout
const gameLoop = function () {
    ctx.clearRect(0, 0, width, height)
    drawScore()
    snake.move()
    snake.draw()
    apple.draw()
    drawBorder()

    // This is set to false by the gameOver function
    if (playing) {
        setTimeout(gameLoop, animationTime)
    }
}

//Start the game loop
gameLoop()

// Convert keycodes to directions
const directions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
}

// The keyboard handler for handling directions key presses
$('body').keydown(function (event) {
    const newDirection = directions[event.keyCode]
    if (newDirection !== undefined) {
        snake.setDirection(newDirection)
    }
})