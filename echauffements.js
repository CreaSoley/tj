/* =========================================================
   VOIX COACH – SpeechSynthesis + Progression
   FONCTIONS : play / pause / stop
========================================================= */

let data = null;
let current = null;

let isPlaying = false;
let isPaused = false;

let speakIndex = 0;
let speakTimeout = null;

let synth = window.speechSynthesis;

/* ===========================
   DOM
=========================== */

const selectEl = document.getElementById("select-echauff");
const bannerTitle = document.getElementById("banner-title");
const bannerMeta = document.getElementById("banner-meta");
const bannerDesc = document.getElementById("banner-description");

const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
const btnStop = document.getElementById("btn-stop");

const progressEl = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");


/* ===========================
   CHARGEMENT JSON
=========================== */

fetch("echauffements.json")
  .then(res => res.json())
  .then(json => {
    data = json.echauffements;
    populateSelect();
    loadExercise(data[0]);
  })
  .catch(err => {
    console.error(err);
  });


/* ===========================
   SELECT
=========================== */

function populateSelect() {
  selectEl.innerHTML = "";

  data.forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex.id;
    opt.textContent = `${ex.id} – ${ex.nom}`;
    selectEl.appendChild(opt);
  });

  selectEl.addEventListener("change", () => {
    const id = selectEl.value;
    const ex = data.find(e => e.id === id);
    loadExercise(ex);
  });
}


/* ===========================
   LOAD EXERCISE
=========================== */

function loadExercise(ex) {
  stopVoice(true);

  current = ex;
  speakIndex = 0;

  bannerTitle.textContent = ex.nom;
  bannerMeta.textContent = `${ex.categorie} • ${ex.duree_totale}`;
  bannerDesc.textContent = ex.presentation;

  updateProgress();
}


/* ===========================
   PROGRESSION
=========================== */

function updateProgress() {
  const total = current.script.length;
  const percent = Math.round((speakIndex / total) * 100);

  progressEl.value = percent;
  progressText.textContent = `${percent}%`;
}


/* ===========================
   VOIX
=========================== */

function speakNext() {
  if (!current) return;

  const seq = current.script;

  if (speakIndex >= seq.length) {
    stopVoice();
    return;
  }

  const item = seq[speakIndex];

  if (item.pause) {
    speakTimeout = setTimeout(() => {
      speakIndex++;
      updateProgress();
      speakNext();
    }, item.pause * 1000);
    return;
  }

  const utter = new SpeechSynthesisUtterance(item.text);
  utter.lang = "fr-FR";

  if (item.mode === "grave") {
    utter.rate = 0.85;
    utter.pitch = 0.65;
  } else if (item.mode === "rapide") {
    utter.rate = 1.15;
    utter.pitch = 1.05;
  } else {
    utter.rate = 1.0;
    utter.pitch = 1.0;
  }

  utter.onend = () => {
    speakIndex++;
    updateProgress();
    speakNext();
  };

  synth.speak(utter);
}


function playVoice() {
  if (!current) return;

  if (isPlaying && isPaused) {
    // resume
    isPaused = false;
    btnPlay.disabled = true;
    btnPause.disabled = false;
    speakNext();
    return;
  }

  if (!isPlaying) {
    isPlaying = true;
    isPaused = false;
    btnPlay.disabled = true;
    btnPause.disabled = false;
    speakNext();
  }
}

function pauseVoice() {
  if (!isPlaying) return;
  isPaused = true;
  synth.pause();
  clearTimeout(speakTimeout);

  btnPlay.disabled = false;
  btnPause.disabled = true;
}

function stopVoice(reset = false) {
  synth.cancel();
  clearTimeout(speakTimeout);

  isPlaying = false;
  isPaused = false;
  speakIndex = 0;

  btnPlay.disabled = false;
  btnPause.disabled = true;

  if (reset) updateProgress();
}
