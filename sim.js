const toggle = document.querySelector("#sim-toggle");
const sim = document.querySelector("#sim");
const ballCanvas = document.querySelector("#balls");
const ballCtx = ballCanvas.getContext("2d");
const dvdLayer = document.querySelector("#dvds");
const runnerLayer = document.querySelector("#runners");
const gameCanvas = document.querySelector("#runner");
const gameCtx = gameCanvas.getContext("2d");

let running = false;
let ballTimer = 0;
let gameTimer = 0;
const waits = [];

const balls = Array.from({ length: 10 }, (_, index) => ({
  x: 80 + index * 70,
  y: 80 + (index % 5) * 90,
  vx: (1.4 + (index % 4) * 0.45) * (index % 2 ? 1 : -1),
  vy: (1.2 + (index % 3) * 0.5) * (index % 3 ? 1 : -1),
  r: 16 + (index % 5) * 7,
  hue: index * 36
}));

const dvds = Array.from({ length: 4 }, (_, index) => {
  const img = document.createElement("img");
  img.src = "dvd.gif";
  img.alt = "";
  img.className = "dvd";
  dvdLayer.appendChild(img);
  return {
    el: img,
    x: 40 + index * 180,
    y: 30 + index * 120,
    vx: 1.3 + index * 0.35,
    vy: 1.1 + (index % 2) * 0.4,
    w: 150,
    h: 66
  };
});

const runners = Array.from({ length: 10 }, () => {
  const img = document.createElement("img");
  img.src = "skeleton-run.gif";
  img.alt = "";
  img.className = "runner";
  runnerLayer.appendChild(img);
  return img;
});

const game = {
  lane: 1,
  obstacles: [],
  spawn: 0,
  score: 0,
  tick: 0
};

function later(fn, ms) {
  const id = setTimeout(fn, ms);
  waits.push(id);
  return id;
}

function resizeBalls() {
  ballCanvas.width = window.innerWidth;
  ballCanvas.height = window.innerHeight;
}

function drawBalls() {
  const width = ballCanvas.width;
  const height = ballCanvas.height;
  ballCtx.fillStyle = "rgba(243, 236, 223, 0.22)";
  ballCtx.fillRect(0, 0, width, height);
  for (const ball of balls) {
    ball.x += ball.vx;
    ball.y += ball.vy;
    if (ball.x < ball.r || ball.x > width - ball.r) ball.vx *= -1;
    if (ball.y < ball.r || ball.y > height - ball.r) ball.vy *= -1;
    const glow = ballCtx.createRadialGradient(ball.x, ball.y, ball.r * 0.2, ball.x, ball.y, ball.r);
    glow.addColorStop(0, `hsla(${ball.hue}, 95%, 72%, 0.95)`);
    glow.addColorStop(1, `hsla(${(ball.hue + 40) % 360}, 90%, 50%, 0.15)`);
    ballCtx.fillStyle = glow;
    ballCtx.beginPath();
    ballCtx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ballCtx.fill();
  }
}

function drawDvds() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  for (const dvd of dvds) {
    dvd.x += dvd.vx;
    dvd.y += dvd.vy;
    if (dvd.x < 0 || dvd.x > width - dvd.w) dvd.vx *= -1;
    if (dvd.y < 0 || dvd.y > height - dvd.h) dvd.vy *= -1;
    dvd.el.style.transform = `translate(${dvd.x}px, ${dvd.y}px)`;
  }
}

function cross(img) {
  if (!running) return;
  const travel = 5000 + Math.random() * 3500;
  img.style.transition = "none";
  img.style.top = `${Math.random() * Math.max(40, window.innerHeight - 140)}px`;
  img.style.transform = "translateX(-40vw)";
  requestAnimationFrame(() => {
    if (!running) return;
    img.style.transition = `transform ${travel}ms linear`;
    img.style.transform = "translateX(110vw)";
  });
  later(() => cross(img), travel + 10000 + Math.random() * 30000);
}

function drawGame(dt) {
  const width = gameCanvas.width;
  const height = gameCanvas.height;
  game.tick += dt;
  game.score += dt * 10;
  game.spawn -= dt;
  if (game.spawn <= 0) {
    game.spawn = 0.55 + Math.random() * 0.45;
    game.obstacles.push({
      lane: Math.floor(Math.random() * 3),
      y: -40,
      kind: Math.random() < 0.7 ? "box" : "bar"
    });
  }
  const threat = game.obstacles.find((item) => item.lane === game.lane && item.y > height * 0.45 && item.y < height * 0.78);
  if (threat) {
    const open = [0, 1, 2].find((lane) => lane !== game.lane && !game.obstacles.some((item) => item.lane === lane && item.y > height * 0.4 && item.y < height * 0.85));
    if (open !== undefined) game.lane = open;
  }
  gameCtx.fillStyle = "#87d6ff";
  gameCtx.fillRect(0, 0, width, height);
  gameCtx.fillStyle = "#6b7280";
  gameCtx.fillRect(28, 0, width - 56, height);
  for (let lane = 1; lane < 3; lane += 1) {
    gameCtx.strokeStyle = "rgba(255,255,255,0.55)";
    gameCtx.setLineDash([16, 14]);
    gameCtx.beginPath();
    gameCtx.moveTo(28 + lane * ((width - 56) / 3), 0);
    gameCtx.lineTo(28 + lane * ((width - 56) / 3), height);
    gameCtx.stroke();
  }
  gameCtx.setLineDash([]);
  const laneWidth = (width - 56) / 3;
  for (const item of game.obstacles) {
    item.y += dt * 280;
    const x = 28 + item.lane * laneWidth + 10;
    gameCtx.fillStyle = item.kind === "box" ? "#f4c542" : "#ef4444";
    gameCtx.fillRect(x, item.y, laneWidth - 20, item.kind === "box" ? 46 : 18);
  }
  game.obstacles = game.obstacles.filter((item) => item.y < height + 40);
  const px = 28 + game.lane * laneWidth + laneWidth / 2;
  const py = height - 78;
  gameCtx.fillStyle = "#1f2937";
  gameCtx.fillRect(px - 14, py, 28, 36);
  gameCtx.beginPath();
  gameCtx.arc(px, py - 12, 12, 0, Math.PI * 2);
  gameCtx.fill();
  gameCtx.fillStyle = "#fff";
  gameCtx.font = "16px sans-serif";
  gameCtx.fillText(String(Math.floor(game.score)), 12, 24);
}

function frame(time) {
  if (!running) return;
  const dt = Math.min(0.05, (time - (frame.last || time)) / 1000);
  frame.last = time;
  drawBalls();
  drawDvds();
  drawGame(dt);
  ballTimer = requestAnimationFrame(frame);
}

const popupLayer = document.querySelector("#popups");
const gamePop = document.querySelector("#runner-pop");
const notes = [
  "Close this window.",
  "Another popup.",
  "You have to close this one too.",
  "Still here until you close it.",
  "One more window.",
  "This will not go away on its own."
];

function spawnPopup() {
  if (!running) return;
  if (popupLayer.children.length >= 6) {
    later(spawnPopup, 2500);
    return;
  }
  const card = document.createElement("section");
  card.className = "annoy";
  card.style.left = `${8 + Math.random() * Math.max(40, window.innerWidth - 300)}px`;
  card.style.top = `${48 + Math.random() * Math.max(40, window.innerHeight - 240)}px`;
  const note = notes[Math.floor(Math.random() * notes.length)];
  card.innerHTML = `<p class="pop-title">Popup <button type="button" class="pop-close">Close</button></p><p class="annoy-copy">${note}</p>`;
  card.querySelector("button").addEventListener("click", () => card.remove());
  popupLayer.appendChild(card);
  later(spawnPopup, 2800 + Math.random() * 2200);
}

function startSim() {
  if (running) return;
  running = true;
  document.body.classList.add("sim-on");
  sim.hidden = false;
  gamePop.hidden = false;
  toggle.setAttribute("aria-pressed", "true");
  resizeBalls();
  runners.forEach((img, index) => {
    later(() => cross(img), index * 700);
  });
  spawnPopup();
  later(spawnPopup, 600);
  frame.last = performance.now();
  ballTimer = requestAnimationFrame(frame);
}

function stopSim() {
  running = false;
  cancelAnimationFrame(ballTimer);
  for (const id of waits) clearTimeout(id);
  waits.length = 0;
  popupLayer.replaceChildren();
  document.body.classList.remove("sim-on");
  sim.hidden = true;
  toggle.setAttribute("aria-pressed", "false");
}

document.querySelector("#close-game").addEventListener("click", () => {
  gamePop.hidden = true;
});

toggle.addEventListener("click", () => {
  if (running) stopSim();
  else startSim();
});

window.addEventListener("resize", () => {
  if (running) resizeBalls();
});

gameTimer = 0;
