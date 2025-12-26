const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;
const gridSize = 20;

let player = { x: 200, y: 200, dx: gridSize, dy: 0 };
let score = 0;
let gameStartTime = Date.now();
let highscore = localStorage.getItem("pro_highscore") || 0;
document.getElementById("highscore").innerText = highscore;

let coins = [], bombs = [], bots = [];

// --- МАЛЮВАННЯ ПОКРАЩЕНОГО ЧОЛОВІЧКА ---
function drawPlayer(x, y) {
    // Тінь під ногами
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath(); ctx.ellipse(x+10, y+20, 8, 4, 0, 0, Math.PI*2); ctx.fill();

    // Тулуб (синій комбінезон)
    ctx.fillStyle = "#2980b9";
    ctx.fillRect(x + 5, y + 8, 10, 10);

    // Голова (бежева)
    ctx.fillStyle = "#ffdbac";
    ctx.beginPath(); ctx.arc(x + 10, y + 5, 5, 0, Math.PI * 2); ctx.fill();

    // Очі
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 7, y + 4, 2, 2); ctx.fillRect(x + 11, y + 4, 2, 2);

    // Ноги
    ctx.fillStyle = "#34495e";
    ctx.fillRect(x + 5, y + 18, 4, 4); ctx.fillRect(x + 11, y + 18, 4, 4);
}

// --- МАЛЮВАННЯ КРУТОЇ МОНЕТИ ---
function drawCoin(x, y) {
    let grad = ctx.createRadialGradient(x+10, y+10, 2, x+10, y+10, 8);
    grad.addColorStop(0, "#fff200");
    grad.addColorStop(1, "#f39c12");

    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x + 10, y + 10, 8, 0, Math.PI * 2); ctx.fill();
    
    // Блик на монеті
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x+10, y+10, 5, -1, 0); ctx.stroke();
}

// --- МАЛЮВАННЯ БОМБИ ---
function drawBomb(x, y) {
    // Корпус
    let grad = ctx.createRadialGradient(x+8, y+8, 2, x+10, y+10, 10);
    grad.addColorStop(0, "#444");
    grad.addColorStop(1, "#111");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x + 10, y + 12, 8, 0, Math.PI * 2); ctx.fill();
    
    // Гніт
    ctx.strokeStyle = "#e67e22";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x+10, y+4); ctx.quadraticCurveTo(x+15, y, x+12, y-2); ctx.stroke();
}

// --- МАЛЮВАННЯ БОТА-ПЕРЕСЛІДУВАЧА ---
function drawEnemy(x, y) {
    let grad = ctx.createLinearGradient(x, y, x+20, y+20);
    grad.addColorStop(0, "#e74c3c");
    grad.addColorStop(1, "#f1c40f");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x + 10, y + 10, 9, 0, Math.PI * 2); ctx.fill();
    
    // Пульсуючий центр
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(x + 10, y + 10, 3 + Math.sin(Date.now()/100)*2, 0, Math.PI * 2); ctx.fill();
}

function update() {
    player.x += player.dx;
    player.y += player.dy;

    if (player.x < 0) player.x = canvas.width - gridSize;
    if (player.x >= canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height - gridSize;
    if (player.y >= canvas.height) player.y = 0;

    coins = coins.filter(c => {
        if (player.x === c.x && player.y === c.y) {
            score++;
            document.getElementById("score").innerText = score;
            if (score > highscore) {
                highscore = score;
                localStorage.setItem("pro_highscore", highscore);
                document.getElementById("highscore").innerText = highscore;
            }
            return false;
        }
        return c.timer-- > 0;
    });

    bombs = bombs.filter(b => {
        if (player.x === b.x && player.y === b.y) endGame();
        return b.timer-- > 0;
    });

    if (Date.now() - gameStartTime > 15000) {
        bots.forEach(bot => {
            if (Math.random() < 0.15) {
                // Бот стає розумнішим: повертає в бік гравця
                if (player.x > bot.x) bot.dx = gridSize; else bot.dx = -gridSize;
                if (player.y > bot.y) bot.dy = gridSize; else bot.dy = -gridSize;
            }
            bot.x += bot.dx; bot.y += bot.dy;
            if (player.x === bot.x && player.y === bot.y) endGame();
        });
        bots = bots.filter(bot => bot.timer-- > 0);
    }
}

function draw() {
    // Фон з легким візерунком сітки
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "#222";
    for(let i=0; i<canvas.width; i+=gridSize) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,400); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(400,i); ctx.stroke();
    }

    coins.forEach(c => drawCoin(c.x, c.y));
    bombs.forEach(b => drawBomb(b.x, b.y));
    bots.forEach(bot => drawEnemy(bot.x, bot.y));
    drawPlayer(player.x, player.y);
}

function endGame() {
    document.getElementById("game-over").style.display = "block";
    document.getElementById("final-score").innerText = score;
    clearInterval(gameLoopInterval);
}

function spawnObject(array, timer) {
    array.push({
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
        timer: timer,
        dx: gridSize, dy: 0
    });
}

const gameLoopInterval = setInterval(() => { update(); draw(); }, 120);
setInterval(() => spawnObject(coins, 60), 2000);
setInterval(() => spawnObject(bombs, 70), 4000);
setInterval(() => { if(Date.now()-gameStartTime > 15000) spawnObject(bots, 100) }, 6000);

// Керування
const setDir = (x, y) => { if(player.dx === 0 && x !== 0 || player.dy === 0 && y !== 0) { player.dx = x; player.dy = y; } };
document.getElementById("btn-up").onclick = () => setDir(0, -gridSize);
document.getElementById("btn-down").onclick = () => setDir(0, gridSize);
document.getElementById("btn-left").onclick = () => setDir(-gridSize, 0);
document.getElementById("btn-right").onclick = () => setDir(gridSize, 0);
