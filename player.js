const audio = document.querySelector("#song");
audio.volume = 0.3;
const play = document.querySelector("#play");
const title = document.querySelector("#song-title");
const now = document.querySelector("#song-now");
const end = document.querySelector("#song-end");
const seek = document.querySelector("#seek");
const mute = document.querySelector("#mute");

const tracks = [
  { title: "Morning", src: "audio/morning.mp3" },
  { title: "Easy Lemon", src: "audio/easy-lemon.mp3" },
  { title: "Wallpaper", src: "audio/wallpaper.mp3" }
];

let index = 0;
let seeking = false;

function clock(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function load(next) {
  index = (next + tracks.length) % tracks.length;
  const track = tracks[index];
  title.textContent = track.title;
  audio.src = track.src;
  seek.value = "0";
  seek.style.setProperty("--progress", "0%");
  now.textContent = "0:00";
}

function paint() {
  const duration = audio.duration;
  end.textContent = clock(duration);
  if (seeking || !Number.isFinite(duration) || duration === 0) return;
  const ratio = audio.currentTime / duration;
  seek.value = String(Math.round(ratio * 1000));
  seek.style.setProperty("--progress", `${ratio * 100}%`);
  now.textContent = clock(audio.currentTime);
}

function start() {
  audio.play().then(() => {
    play.setAttribute("aria-label", "Pause");
    play.setAttribute("aria-pressed", "true");
  }).catch(() => {});
}

function pause() {
  audio.pause();
  play.setAttribute("aria-label", "Play");
  play.setAttribute("aria-pressed", "false");
}

load(0);
audio.addEventListener("loadedmetadata", paint);
audio.addEventListener("timeupdate", paint);
audio.addEventListener("ended", () => {
  load(index + 1);
  start();
});

seek.addEventListener("pointerdown", () => {
  seeking = true;
});
seek.addEventListener("pointerup", () => {
  seeking = false;
  paint();
});
seek.addEventListener("input", () => {
  if (!Number.isFinite(audio.duration)) return;
  const ratio = Number(seek.value) / 1000;
  audio.currentTime = ratio * audio.duration;
  seek.style.setProperty("--progress", `${ratio * 100}%`);
  now.textContent = clock(audio.currentTime);
});

play.addEventListener("click", () => {
  if (audio.paused) start();
  else pause();
});

mute.addEventListener("click", (event) => {
  event.stopPropagation();
  audio.muted = !audio.muted;
  mute.textContent = audio.muted ? "Unmute" : "Mute";
  mute.setAttribute("aria-pressed", String(audio.muted));
});
