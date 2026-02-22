// =========================
// Images
// =========================
const walkImg = new Image();
walkImg.src = "assets/player/walk.png"; // 4x4 walking sprite

const idleImg = new Image();
idleImg.src = "assets/player/idle.png"; // 4x4 idle sprite (or 4x3 treated as 4x4)

// Grass tile
const grassImg = new Image();
grassImg.src = "assets/tiles/grass.png"; // 30x30 px

// =========================
// Canvas setup
// =========================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;
ctx.imageSmoothingEnabled = false;

// =========================
// Player block
// =========================
const playerBlock = {
    x: 300,
    y: 300,
    width: 64,
    height: 80
};

// Offsets for sprite alignment
const walkOffset = { x: 0, y: 5 };
const idleOffset = { x: 0, y: 5 };

// Player state
const player = {
    direction: 0,       // 0=forward,1=right,2=back,3=left
    lastDirection: 0,
    frame: 0,
    moving: false,
    speed: 2
};

// Sprite sheet info
const WALK_ROWS = 4;
const WALK_COLS = 4;
const IDLE_ROWS = 4;
const IDLE_COLS = 4;

// =========================
// Mobile input
// =========================
const keys = {};
document.querySelectorAll(".dir-btn").forEach(btn => {
    const dir = btn.dataset.dir;
    btn.addEventListener("touchstart", () => keys[dir] = true);
    btn.addEventListener("touchend", () => keys[dir] = false);
});

// Joystick support
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
let joystickData = { x:0, y:0, active:false };

joystick.addEventListener("touchstart", e => {
    joystickData.active = true;
    moveStick(e.touches[0]);
});
joystick.addEventListener("touchmove", e => {
    if(joystickData.active) moveStick(e.touches[0]);
});
joystick.addEventListener("touchend", e => {
    joystickData.active = false;
    joystickData.x = 0;
    joystickData.y = 0;
    stick.style.transform = `translate(-50%, -50%)`;
});

function moveStick(touch){
    const rect = joystick.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;

    let dx = touch.clientX - cx;
    let dy = touch.clientY - cy;

    const maxDist = rect.width/2;
    const dist = Math.min(Math.hypot(dx, dy), maxDist);
    const angle = Math.atan2(dy, dx);

    const nx = Math.cos(angle)*dist;
    const ny = Math.sin(angle)*dist;

    stick.style.transform = `translate(${nx}px, ${ny}px)`;
    joystickData.x = nx / maxDist;
    joystickData.y = ny / maxDist;
}

// Action button
const actionBtn = document.getElementById("actionBtn");
actionBtn.addEventListener("touchstart", () => {
    console.log("Action triggered!");
});

// =========================
// Animation timing
// =========================
let timer = 0;
const SPEED = 10;

// =========================
// Player update
// =========================
function update() {
    player.moving = false;

    // Keyboard
    if(keys["up"])    { playerBlock.y -= player.speed; player.direction = 0; player.moving = true; }
    if(keys["right"]) { playerBlock.x += player.speed; player.direction = 1; player.moving = true; }
    if(keys["down"])  { playerBlock.y += player.speed; player.direction = 2; player.moving = true; }
    if(keys["left"])  { playerBlock.x -= player.speed; player.direction = 3; player.moving = true; }

    // Joystick
    if(joystickData.active){
        const dx = joystickData.x * player.speed * 5; // scale speed
        const dy = joystickData.y * player.speed * 5;
        playerBlock.x += dx;
        playerBlock.y += dy;

        // Determine direction for animation
        if(Math.abs(dx) > Math.abs(dy)){
            player.direction = dx > 0 ? 1 : 3;
        } else if(Math.abs(dy) > 0){
            player.direction = dy > 0 ? 2 : 0;
        }
        player.moving = true;
    }

    if(player.moving) player.lastDirection = player.direction;

    timer++;
    if(timer >= SPEED){
        timer = 0;
        if(player.moving){
            player.frame = (player.frame + 1) % WALK_ROWS; // row animation
        } else {
            player.frame = 0; // idle first frame
        }
    }
}

// =========================
// Draw grass tiles
// =========================
const TILE_SIZE = 30;

function drawGrass() {
    const rows = Math.ceil(canvas.height / TILE_SIZE);
    const cols = Math.ceil(canvas.width / TILE_SIZE);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.drawImage(grassImg, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

// =========================
// Draw sprites
// =========================
function drawSprite(sheet, frameRow, frameCol, offset){
    const srcW = sheet.width / WALK_COLS;
    const srcH = sheet.height / WALK_ROWS;

    ctx.drawImage(
        sheet,
        frameCol * srcW,
        frameRow * srcH,
        srcW,
        srcH,
        playerBlock.x - playerBlock.width/2 + offset.x,
        playerBlock.y - playerBlock.height + offset.y,
        playerBlock.width,
        playerBlock.height
    );
}

// =========================
// Draw loop
// =========================
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw grass background
    drawGrass();

    // Draw player
    if(player.moving){
        drawSprite(walkImg, player.frame, player.direction, walkOffset);
    } else {
        drawSprite(idleImg, 0, player.lastDirection, idleOffset);
    }
}

// =========================
// Image loading
// =========================
let loaded = 0;
function checkStart(){
    loaded++;
    if(loaded === 3){ // walk + idle + grass
        requestAnimationFrame(loop);
    }
}
walkImg.onload = checkStart;
idleImg.onload = checkStart;
grassImg.onload = checkStart;

// =========================
// Main loop
// =========================
function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}