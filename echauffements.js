
let data = [];
let currentExercise = null;
let currentIndex = 0;
let startTime = null;
let pausedAt = 0;
let isPaused = false;
let timer = null;

const select = document.getElementById("selectEchauffement");
const presentation = document.getElementById("presentation");
const scriptPreview = document.getElementById("scriptPreview");

const progressFill = document.getElementById("progressFill");
const timeLeft = document.getElementById("timeLeft");
const timeTotal = document.getElementById("timeTotal");

const btnPlay = document.getElementById("btnPlay");
const btnPause = document.getElementById("btnPause");
const btnStop = document.getElementById("btnStop");

// -----------------------
// Charger le JSON
// -----------------------
fetch("echauffements.json")
  .then(res => res.json())
  .then(json => {
    data = json.echauffements;
    populateSelect();
    loadExercise(data[0]);
  })
  .catch(err => console.error(err));

function populateSelect() {
  select.innerHTML = "";
  data.forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex.id;
    opt.textContent = `${ex.id} – ${ex.nom}`;
    select.appendChild(opt);
  });
}

select.addEventListener("change", () => {
  const ex = data.find(e => e.id === select.value);
  if (ex) loadExercise(ex);
});

// -----------------------
// Charger un échauffement
// -----------------------
function loadExercise(ex) {
  currentExercise = ex;
  currentIndex = 0;
  startTime = null;
  pausedAt = 0;
  isPaused = false;

  // affichage
  presentation.textContent = ex.presentation;
  document.getElementById("uv-title").textContent = `${ex.id} – ${ex.nom}`;

  // preview du script
  scriptPreview.innerHTML = "";
  ex.script.forEach(item => {
    const p = document.createElement("p");
    if (item.text) p.textContent = item.text;
    if (item.pause) p.textContent = `Pause : ${item.pause}s`;
    scriptPreview.appendChild(p);
  });

  // temps
  timeTotal.textContent = formatTime(ex.duree_totale_sec);
  timeLeft.textContent = formatTime(ex.duree_totale_sec);
  progressFill.style.width = "0%";
}

// -----------------------
// Lecture vocale
// -----------------------
function speakItem(item) {
  return new Promise((resolve) => {
    if (item.pause) {
      setTimeout(resolve, item.pause * 1000);
      return;
    }

    const utt = new SpeechSynthesisUtterance(item.text);

    // dramatic = grave + lent
    if (item.mode === "grave") {
      utt.rate = 0.8;     // lent
      utt.pitch = 0.7;    // grave
    } else if (item.mode === "rapide") {
      utt.rate = 1.1;
      utt.pitch = 1.0;
    } else {
      utt.rate = 0.95;
      utt.pitch = 0.9;
    }

    utt.onend = () => resolve();
    speechSynthesis.speak(utt);
  });
}

async function play() {
  if (!currentExercise) return;

  if (isPaused) {
    isPaused = false;
    startTime = Date.now() - pausedAt;
  } else {
    startTime = Date.now();
  }

  btnPlay.disabled = true;
  btnPause.disabled = false;

  while (currentIndex < currentExercise.script.length) {
    if (isPaused) return;

    const item = currentExercise.script[currentIndex];
    await speakItem(item);
    currentIndex++;
  }

  // fin
  btnPlay.disabled = false;
  btnPause.disabled = true;
}

// -----------------------
// Pause / Stop
// -----------------------
btnPlay.addEventListener("click", () => play());

btnPause.addEventListener("click", () => {
  isPaused = true;
  pausedAt = Date.now() - startTime;
  speechSynthesis.cancel();
});

btnStop.addEventListener("click", () => {
  isPaused = false;
  currentIndex = 0;
  pausedAt = 0;
  startTime = null;
  speechSynthesis.cancel();
  btnPlay.disabled = false;
  btnPause.disabled = true;
});

// -----------------------
// Progression
// -----------------------
function updateProgress() {
  if (!currentExercise || !startTime) return;

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = Math.max(0, currentExercise.duree_totale_sec - elapsed);

  timeLeft.textContent = formatTime(remaining);
  const pct = Math.min(100, (elapsed / currentExercise.duree_totale_sec) * 100);
  progressFill.style.width = pct + "%";

  if (remaining <= 0) {
    clearInterval(timer);
  }
}

timer = setInterval(updateProgress, 500);

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
