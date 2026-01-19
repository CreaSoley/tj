/* =========================================================
   APP ÉCHAUFFEMENTS – VERSION AVANCÉE
========================================================= */

let echauffements = [];
let currentExercise = null;

let phaseIndex = 0;
let scriptIndex = 0;

let totalTimeLeft = 0;
let phaseTimeLeft = 0;

let timer = null;
let isPaused = false;
let utterance = null;


/* ===========================
   DOM
=========================== */

const titleEl = document.getElementById("exercise-title");
const phaseTitleEl = document.getElementById("phase-title");
const visualEl = document.getElementById("visual");
const timerEl = document.getElementById("timer-display");

const btnStart = document.getElementById("btn-start");
const btnStop = document.getElementById("btn-stop");

const selectEl = document.getElementById("exercise-select");
const descEl = document.getElementById("exercise-description");
const progressBar = document.getElementById("progress-bar");


/* ===========================
   DESCRIPTIONS
=========================== */

const descriptions = {
  "E01": "Choisis cet échauffement si tu veux réveiller tout le corps rapidement et entrer progressivement dans une dynamique martiale complète.",
  "E02": "Choisis cet échauffement si tu te sens raide ou dispersé et que tu veux retrouver coordination, continuité et fluidité.",
  "E03": "Choisis cet échauffement si tu veux relâcher les tensions, gagner en amplitude et préparer un travail fluide sans impact.",
  "E04": "Choisis cet échauffement si tu veux calmer le mental, améliorer ton souffle et installer une présence stable.",
  "E05": "Choisis cet échauffement si tu manques d’énergie et que tu veux activer rapidement vitesse, réactivité et vigilance.",
  "E06": "Choisis cet échauffement si tu veux te placer mentalement comme le jour du passage, sérieux, concentré et prêt.",
  "E07": "Choisis cet échauffement si tu es fatigué ou limité physiquement mais que tu veux malgré tout travailler le centrage.",
  "E08": "Choisis cet échauffement si tu as besoin d’une remise en route douce, articulaire et respiratoire, sans stress physique.",
  "E09": "Choisis cet échauffement si tu veux activer l’intention et le zanshin sans bouger, uniquement par le mental.",
  "E10": "Choisis cet échauffement si tu ressens des épaules hautes ou une respiration inefficace et que tu veux redescendre dans le centre.",
  "E11": "Choisis cet échauffement si tu veux renforcer l’alignement, la stabilité et la connexion entre le sol et le hara.",
  "E12": "Choisis cet échauffement si tu veux développer une présence calme, immobile et immédiatement perceptible.",
  "E13": "Choisis cet échauffement si tu veux apprendre à conserver la présence même après la fin d’une technique.",
  "E14": "Choisis cet échauffement si tu veux entrer dans ton kata avec un centre stable, un mental calme et une continuité totale.",
  "E15": "Choisis cet échauffement si tu veux marquer le jury en montrant que ton engagement continue après la dernière technique."
};


/* ===========================
   CHARGEMENT JSON
=========================== */

fetch("echauffements.json")
  .then(res => res.json())
  .then(data => {
    echauffements = data.echauffements;
    populateSelect();
    initExercise(echauffements[0]);
  });


/* ===========================
   SÉLECTEUR
=========================== */

function populateSelect() {
  echauffements.forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex.id;
    opt.textContent = `${ex.id} – ${ex.nom}`;
    selectEl.appendChild(opt);
  });
}

selectEl.addEventListener("change", () => {
  const ex = echauffements.find(e => e.id === selectEl.value);
  if (ex) initExercise(ex);
});


/* ===========================
   INIT
=========================== */

function initExercise(ex) {
  stopAll();
  currentExercise = ex;

  titleEl.textContent = ex.nom;
  descEl.textContent = descriptions[ex.id] || "";

  phaseIndex = 0;
  scriptIndex = 0;
  totalTimeLeft = ex.duree_totale_sec;

  progressBar.max = ex.duree_totale_sec;
  progressBar.value = 0;

  loadPhase();
  updateTimer();
}


/* ===========================
   PHASE
=========================== */

function loadPhase() {
  const phase = currentExercise.phases[phaseIndex];
  phaseTimeLeft = phase.duree;
  scriptIndex = 0;

  phaseTitleEl.textContent = phase.nom;
  speak(phase.script[0], "grave");
  visualEl.textContent = phase.script[0];
}

function nextPhase() {
  phaseIndex++;
  if (phaseIndex >= currentExercise.phases.length) {
    finish();
    return;
  }
  loadPhase();
}


/* ===========================
   TIMER
=========================== */

function start() {
  if (timer) return;

  timer = setInterval(() => {
    if (isPaused) return;

    totalTimeLeft--;
    phaseTimeLeft--;
    progressBar.value++;

    advanceScript();

    if (phaseTimeLeft <= 0) nextPhase();
    if (totalTimeLeft <= 0) finish();

    updateTimer();
  }, 1000);
}

function pause() {
  isPaused = !isPaused;
  speechSynthesis.cancel();
}

function stopAll() {
  clearInterval(timer);
  timer = null;
  isPaused = false;
  speechSynthesis.cancel();
}

function finish() {
  stopAll();
  visualEl.textContent = "Échauffement terminé 🌸";
  phaseTitleEl.textContent = "Terminé";
  timerEl.textContent = "00:00";
}


/* ===========================
   SCRIPT + VOIX
=========================== */

function advanceScript() {
  const phase = currentExercise.phases[phaseIndex];
  const stepTime = Math.floor(phase.duree / phase.script.length);

  if (
    phaseTimeLeft % stepTime === 0 &&
    scriptIndex < phase.script.length - 1
  ) {
    scriptIndex++;
    const text = phase.script[scriptIndex];
    visualEl.textContent = text;
    speak(text, scriptIndex % 3 === 0 ? "rapide" : "normal");
  }
}

function speak(text, mode = "normal") {
  if (!window.speechSynthesis) return;

  speechSynthesis.cancel();

  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";

  if (mode === "grave") {
    utterance.rate = 0.85;
    utterance.pitch = 0.7;
  } else if (mode === "rapide") {
    utterance.rate = 1.1;
    utterance.pitch = 1;
  } else {
    utterance.rate = 1;
    utterance.pitch = 1;
  }

  speechSynthesis.speak(utterance);
}


/* ===========================
   UI
=========================== */

function updateTimer() {
  timerEl.textContent = formatTime(totalTimeLeft);
}

function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}


/* ===========================
   BOUTONS
=========================== */

btnStart.addEventListener("click", () => {
  if (!timer) {
    start();
    btnStart.textContent = "⏸ Pause";
  } else {
    pause();
    btnStart.textContent = isPaused ? "▶ Reprendre" : "⏸ Pause";
  }
});

btnStop.addEventListener("click", () => {
  stopAll();
  initExercise(currentExercise);
  btnStart.textContent = "▶ Démarrer";
});
