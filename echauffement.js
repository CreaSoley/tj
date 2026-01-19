/* =========================================================
   APP ÉCHAUFFEMENTS – VERSION STABLE
   JSON séparé : echauffements.json
========================================================= */

/* ===========================
   ÉTAT GLOBAL
=========================== */

let echauffements = [];
let currentExercise = null;

let phaseIndex = 0;
let scriptIndex = 0;

let totalTimeLeft = 0;
let phaseTimeLeft = 0;

let timer = null;
let isPaused = false;


/* ===========================
   DOM
=========================== */

const titleEl = document.getElementById("exercise-title");
const phaseTitleEl = document.getElementById("phase-title");
const visualEl = document.getElementById("visual");
const timerEl = document.getElementById("timer-display");

const btnStart = document.getElementById("btn-start");
const btnStop = document.getElementById("btn-stop");


/* ===========================
   CHARGEMENT JSON
=========================== */

fetch("echauffements.json")
  .then(res => {
    if (!res.ok) throw new Error("JSON introuvable");
    return res.json();
  })
  .then(data => {
    echauffements = data.echauffements;
    if (!echauffements || echauffements.length === 0) {
      throw new Error("Aucun échauffement trouvé");
    }
    initExercise(echauffements[0]); // E01 par défaut
  })
  .catch(err => {
    console.error(err);
    visualEl.textContent = "Erreur de chargement des échauffements";
  });


/* ===========================
   INITIALISATION
=========================== */

function initExercise(exercise) {
  stopTimer(true);

  currentExercise = exercise;
  phaseIndex = 0;
  scriptIndex = 0;

  totalTimeLeft = exercise.duree_totale_sec;
  loadPhase();

  titleEl.textContent = exercise.nom;
  updateTimerDisplay();
}


/* ===========================
   GESTION DES PHASES
=========================== */

function loadPhase() {
  const phase = currentExercise.phases[phaseIndex];
  if (!phase) return;

  phaseTimeLeft = phase.duree;
  scriptIndex = 0;

  phaseTitleEl.textContent = phase.nom;
  visualEl.textContent = phase.script[0] || "";
}

function nextPhase() {
  phaseIndex++;

  if (phaseIndex >= currentExercise.phases.length) {
    finishExercise();
    return;
  }

  loadPhase();
}


/* ===========================
   TIMER PRINCIPAL
=========================== */

function startTimer() {
  if (timer) return;

  isPaused = false;

  timer = setInterval(() => {
    if (isPaused) return;

    totalTimeLeft--;
    phaseTimeLeft--;

    advanceScript();

    if (phaseTimeLeft <= 0) {
      nextPhase();
    }

    if (totalTimeLeft <= 0) {
      finishExercise();
    }

    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  isPaused = true;
}

function stopTimer(reset = false) {
  clearInterval(timer);
  timer = null;
  isPaused = false;

  if (reset && currentExercise) {
    initExercise(currentExercise);
  }
}

function finishExercise() {
  stopTimer();
  phaseTitleEl.textContent = "Terminé";
  visualEl.textContent = "Échauffement terminé 🌸";
  timerEl.textContent = "00:00";
}


/* ===========================
   SCRIPT PROGRESSIF
=========================== */

function advanceScript() {
  const phase = currentExercise.phases[phaseIndex];
  if (!phase) return;

  const steps = phase.script.length;
  if (steps <= 1) return;

  const stepDuration = Math.floor(phase.duree / steps);

  if (
    phaseTimeLeft > 0 &&
    phaseTimeLeft % stepDuration === 0 &&
    scriptIndex < steps - 1
  ) {
    scriptIndex++;
    visualEl.textContent = phase.script[scriptIndex];
  }
}


/* ===========================
   AFFICHAGE
=========================== */

function updateTimerDisplay() {
  timerEl.textContent = formatTime(totalTimeLeft);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}


/* ===========================
   BOUTONS
=========================== */

btnStart.addEventListener("click", () => {
  if (!timer) {
    startTimer();
  } else {
    isPaused = !isPaused;
    btnStart.textContent = isPaused ? "▶ Reprendre" : "⏸ Pause";
  }
});

btnStop.addEventListener("click", () => {
  stopTimer(true);
  btnStart.textContent = "▶ Démarrer";
});
