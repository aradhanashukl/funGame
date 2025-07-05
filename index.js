
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 576;
const gravity = 0.4;

// Define images
const Bar = new Image();
const hills = new Image();
const background = new Image();
const platformSmallTall = new Image();
const spriteRunLeft = new Image();
const spriteRunRight = new Image();
const spriteStandRight = new Image();
const spriteStandLeft = new Image();

Bar.src = './image/platform.png';
hills.src = './image/hills.png';
background.src = './image/background.png';
platformSmallTall.src = './image/platformSmallTall.png';
spriteRunLeft.src = './image/spriteRunLeft.png';
spriteRunRight.src = './image/spriteRunRight.png';
spriteStandLeft.src = './image/spriteStandLeft.png';
spriteStandRight.src = './image/spriteStandRight.png';

let imagesLoaded = 0;
const totalImages = 8; // Updated total to 8

function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        init();
        animate();
        console.log("ALL UPLOADED");
    }
}

// Set up onload handlers for images
Bar.onload = checkAllImagesLoaded;
hills.onload = checkAllImagesLoaded;
background.onload = checkAllImagesLoaded;
platformSmallTall.onload = checkAllImagesLoaded;
spriteRunLeft.onload = checkAllImagesLoaded;
spriteRunRight.onload = checkAllImagesLoaded;
spriteStandLeft.onload = checkAllImagesLoaded;
spriteStandRight.onload = checkAllImagesLoaded;

class Player {
    constructor() {
        this.speed = 5;
        this.position = { x: 100, y: 100 };
        this.velocity = { x: 0, y: 0 };
        this.width = 66;
        this.height = 130;
        this.onGround = false; // To track if player is on the ground
        this.frames = 0;
        this.sprites = {
            stand: {
                right: spriteStandRight,
                left: spriteStandLeft,
                CropWidth: 177,
                width: 66
            },
            run: {
                right: spriteRunRight,
                left: spriteRunLeft,
                CropWidth: 341,
                width: 127.875
            }
        };
        this.currentSprite = this.sprites.stand.right;
        this.currentCropWidth = 177;
    }

    draw() {
        c.drawImage(
            this.currentSprite,
            this.currentCropWidth * this.frames,
            0,
            this.currentCropWidth,
            400,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    update() {
        this.frames++;
        if (this.frames > (this.currentSprite === this.sprites.stand.right || this.currentSprite === this.sprites.stand.left ? 59 : 29)) {
            this.frames = 0;
        }
        this.draw();
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
            this.onGround = false;
        }
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = 0;
        }
    }
}

class Platform {
    constructor({ x, y }) {
        this.position = { x, y };
        this.width = Bar.width;
        this.height = Bar.height;
        this.image = Bar;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y);
    }
}

class GenericObject {
    constructor({ x, y, image }) {
        this.position = { x, y };
        this.width = image.width;
        this.height = image.height;
        this.image = image;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}

let player = new Player();
let platforms = [];
let genericObjects = [];
let popupShown = false; // Flag to track if the popup has been shown
let lastKey = null;
const keys = {
    right: { pressed: false },
    left: { pressed: false },
};

let scrollOffset = 0;
let win = false;
let lose = false;
let animationId;

function init() {
    player = new Player();
    platforms = [
        new Platform({ x: -1, y: 470 }),
        new Platform({ x: Bar.width - 3, y: 470 }),
        new Platform({ x: Bar.width * 2 + 250, y: 470 }),
        new Platform({ x: Bar.width * 4 + 600, y: 470 }),
        new Platform({ x: Bar.width * 4 + 1200, y: 200 }),
        new Platform({ x: platformSmallTall.width * 6 + 400, y: 210 })
    ];
    genericObjects = [
        new GenericObject({ x: -1, y: -1, image: background }),
        new GenericObject({ x: -1, y: -1, image: hills }),
    ];
    scrollOffset = 0;
    popupShown = false; // Reset the popup flag
    win = false;
    lose = false;

    // Clear existing animation frame requests
    cancelAnimationFrame(animationId);
}

function keydownHandler(event) {
    switch (event.keyCode) {
        case 65: // Left
            keys.left.pressed = true;
            lastKey = 'left';
            break;
        case 68: // Right
            keys.right.pressed = true;
            lastKey = 'right';
            break;
        case 87: // Up
            if (player.onGround) {
                player.velocity.y -= 14.5;
            }
            break;
    }
}

function keyupHandler(event) {
    switch (event.keyCode) {
        case 65: // Left
            keys.left.pressed = false;
            break;
        case 68: // Right
            keys.right.pressed = false;
            break;
    }
}

function animate() {
    if (!win && !lose) {
        animationId = requestAnimationFrame(animate); // Store the animation frame ID for later cancellation
    }
    c.clearRect(0, 0, canvas.width, canvas.height);
    genericObjects.forEach((genericObject) => genericObject.draw());
    platforms.forEach((platform) => platform.draw());
    player.update();

    // Handle movement and scrolling
    if (keys.right.pressed && player.position.x < canvas.width / 2) {
        player.velocity.x = player.speed;
    } else if (keys.left.pressed && player.position.x > canvas.width / 2) {
        player.velocity.x = -player.speed;
    } else {
        player.velocity.x = 0;
    }

    if (keys.right.pressed && player.position.x >= 500) {
        scrollOffset += player.speed;
        platforms.forEach((platform) => {
            platform.position.x -= player.speed;
        });
        genericObjects.forEach((genericObject) => {
            genericObject.position.x -= player.speed * 0.66;
        });
    }

    if (keys.left.pressed && player.position.x <= canvas.width / 2 && scrollOffset > 0) {
        scrollOffset -= player.speed;
        platforms.forEach((platform) => {
            platform.position.x += player.speed;
        });
        genericObjects.forEach((genericObject) => {
            genericObject.position.x += player.speed * 0.66;
        });
    }


    platforms.forEach((platform) => {
        if (
            player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width
        ) {
            player.velocity.y = 0;
            player.position.y = platform.position.y - player.height;
            player.onGround = true;
        }
    });

    // Handle sprite changes
    if (keys.right.pressed && player.currentSprite !== player.sprites.run.right) {
        player.frames = 0;
        player.currentSprite = player.sprites.run.right;
        player.currentCropWidth = player.sprites.run.CropWidth;
        player.width = player.sprites.run.width;
    } else if (!keys.right.pressed && lastKey === 'right' && player.currentSprite !== player.sprites.stand.right) {
        player.frames = 0;
        player.currentSprite = player.sprites.stand.right;
        player.currentCropWidth = player.sprites.stand.CropWidth;
        player.width = player.sprites.stand.width;
    } else if (keys.left.pressed && player.currentSprite !== player.sprites.run.left) {
        player.frames = 0;
        player.currentSprite = player.sprites.run.left;
        player.currentCropWidth = player.sprites.run.CropWidth;
        player.width = player.sprites.run.width;
    } else if (!keys.left.pressed && lastKey === 'left' && player.currentSprite !== player.sprites.stand.left) {
        player.frames = 0;
        player.currentSprite = player.sprites.stand.left;
        player.currentCropWidth = player.sprites.stand.CropWidth;
        player.width = player.sprites.stand.width;
    }

    if (scrollOffset > 3505) {
        win = true;
        console.log('GAME OVER!');
        c.fillStyle = 'black';
        c.font = ' bold 50px serif ';
        c.fillText('CONGRATS, YOU WON! 🤗', canvas.width / 2 - 200, canvas.height / 2);
        if (!popupShown) {
            popupShown = true;
            setTimeout(() => {
                if (confirm('Congrats, you won! Do you want to play again? Press OK to restart or Cancel to stop.')) {
                    init();
                    animate();
                }
            }, 1000);
        }
    }


    if (player.position.y > canvas.height) {
        lose = true;
        console.log('GAME OVER, YOU LOSE ');
        c.fillStyle = 'red';
        c.font = 'bold 50px serif';
        c.fillText('BAD LUCK, YOU LOSE! 😑', canvas.width / 2 - 200, canvas.height / 2);
        if (!popupShown) {
            popupShown = true;
            setTimeout(() => {
                if (confirm('Bad luck, you lose! Do you want to play again? Press OK to restart or Cancel to stop.')) {
                    init();
                    animate();
                }
            }, 1000);
        }
    }
}


addEventListener('keydown', keydownHandler);
addEventListener('keyup', keyupHandler);


