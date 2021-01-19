const canvas = document.querySelector('#canvas');
const buttonStart = document.querySelector('.button__start');
const buttonNewGame = document.querySelector('.button__new-game');
const joystick = document.querySelector('#joystick');

const mediaOptions = window.matchMedia('all and (max-width: 320px)');

if (mediaOptions.matches) {
  canvas.width = 200;
  canvas.height = 200;
}

const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const blockSize = 10;
const widthInBlock = width / blockSize;
const heigthInBlock = height / blockSize;

let score = 0;
let intervalId = null;
// Функция разметки гранниц поля
const drawBorder = function () {
  ctx.fillStyle = 'Gray';
  ctx.fillRect(0, 0, width, blockSize);
  ctx.fillRect(0, height - blockSize, width, blockSize);
  ctx.fillRect(0, 0, blockSize, height);
  ctx.fillRect(width - blockSize, 0, blockSize, height);
};

// Функция количества очков
const drawScore = function () {
  ctx.font = '12px Courier';
  ctx.fillStyle = 'Black';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Score: ' + score, blockSize, blockSize);
};

// Функция конца игры
const gameOver = function () {
  clearInterval(intervalId);
  ctx.font = '30px Courier';
  ctx.fillStyle = 'Red';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Game Over', width / 2, height / 2);
};
//  функция для окружности
const circle = function (x, y, radius, fillCircle) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  if (fillCircle) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
};
// консткуктор ячейки
class Block {
  constructor(col, row) {
    this.col = col;
    this.row = row;
  }
  drawSquare(color) {
    const x = this.col * blockSize;
    const y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
  }
  drawCircle(color) {
    const centerX = this.col * blockSize + blockSize / 2;
    const centery = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centery, blockSize / 2, true);
  }
  equal(otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
  }
}

// конструктор змейки
class Snake {
  constructor() {
    this.segments = [new Block(7, 5), new Block(6, 5), new Block(5, 5)];
    this.direction = 'right';
    this.nextDirection = 'right';
  }
  draw() {
    this.segments.forEach((item, idx) => {
      if (idx % 2 === 0) {
        item.drawSquare('Blue');
      } else {
        item.drawSquare('Green');
      }
    });
  }
  move() {
    const head = this.segments[0];
    let newHead = null;
    this.direction = this.nextDirection;

    if (this.direction === 'right') {
      newHead = new Block(head.col + 1, head.row);
    } else if (this.direction === 'down') {
      newHead = new Block(head.col, head.row + 1);
    } else if (this.direction === 'left') {
      newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === 'up') {
      newHead = new Block(head.col, head.row - 1);
    }

    if (this.checkCollision(newHead)) {
      gameOver();
      return;
    }

    this.segments.unshift(newHead);
    if (newHead.equal(apple.position)) {
      score += 1;
      apple.move();
    } else {
      this.segments.pop();
    }
  }

  checkCollision(head) {
    const leftCollision = head.col === 0;
    const topCollision = head.row === 0;
    const rightCollision = head.col === widthInBlock - 1;
    const bottomCollision = head.row === heigthInBlock - 1;

    let wallCollision =
      leftCollision || topCollision || rightCollision || bottomCollision;

    let selfCollision = false;

    for (let i = 0; i < this.segments.length; i += 1) {
      if (head.equal(this.segments[i])) {
        selfCollision = true;
      }
    }

    return wallCollision || selfCollision;
  }

  setDirection(newDirection) {
    if (this.direction === 'up' && newDirection === 'down') {
      return;
    } else if (this.direction === 'right' && newDirection === 'left') {
      return;
    } else if (this.direction === 'down' && newDirection === 'up') {
      return;
    } else if (this.direction === 'left' && newDirection === 'right') {
      return;
    }
    this.nextDirection = newDirection;
  }
}

class Apple {
  constructor() {
    this.position = new Block(10, 10);
  }

  draw() {
    this.position.drawCircle('LimeGreen');
  }
  move() {
    const randomCol = Math.floor(Math.random() * (widthInBlock - 2) + 1);
    const randomRow = Math.floor(Math.random() * (heigthInBlock - 2) + 1);

    this.position = new Block(randomCol, randomRow);
  }
}
const snake = new Snake();
const apple = new Apple();
drawScore();
drawBorder();

buttonStart.addEventListener('click', startGame);

buttonNewGame.addEventListener('click', event => {
  event.preventDefault();
  location.reload();
});

function startGame() {
  buttonStart.disabled = true;

  intervalId = setInterval(() => {
    ctx.clearRect(0, 0, width, height);
    drawScore();
    snake.move();
    snake.draw();
    apple.draw();
    drawBorder();
  }, 100);
}

// Реализация управления с клавиатуры
const listenEvent = function (event) {
  event.preventDefault();
  isCorrectDirection(event.key);
};

// реализация джостика для телефона
const listetJoystick = function (event) {
  isCorrectDirection(event.target.id);
};

const isCorrectDirection = function (currentDirection) {
  const directions = {
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
  };

  const newDirection = directions[currentDirection];
  if (newDirection !== undefined) {
    snake.setDirection(newDirection);
  }
};

window.addEventListener('keydown', listenEvent);

joystick.addEventListener('click', listetJoystick);
