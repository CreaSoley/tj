const select = document.getElementById("selectEchauffement");
const presentation = document.getElementById("presentation");
const btnPlay = document.getElementById("btnPlay");
const btnPause = document.getElementById("btnPause");
const btnStop = document.getElementById("btnStop");
const progressFill = document.getElementById("progressFill");
const timeLeft = document.getElementById("timeLeft");
const timeTotal = document.getElementById("timeTotal");
const scriptPreview = document.getElementById("scriptPreview");

let data = [];
let current = null;
let currentIndex = 0;
let synth = window.speechSynthesis;
let utterance = null;
let isPaused = false;
let startTime = null;
let elapsed = 0;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function updateProgress() {
  if (!current) return;
  const total = current.duree_totale_sec;
  const elapsedSec = elapsed;
  const pct = Math.min(100, (elapsedSec / total) * 100);
  progressFill.style.width = `${pct}%`;
  timeLeft.textContent = formatTime(total - elapsedSec);
  timeTotal.textContent = formatTime(total);
}

function renderPreview(ex) {
  scriptPreview.innerHTML = "";
  ex.script.forEach(item => {
    if (item.text) {
      const p = document.createElement("p");
      p.textContent = item.text;
      scriptPreview.appendChild(p);
    }
  });
}

function loadExercise(ex) {
  current = ex;
  currentIndex = 0;
  elapsed = 0;
  updateProgress();
  presentation.textContent = ex.presentation || "";
  renderPreview(ex);
}

function populateSelect() {
  select.innerHTML = "";
  data.forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex.id;
    opt.textContent = `${ex.id} – ${ex.nom}`;
    select.appendChild(opt);
  });
}

function findById(id) {
  return data.find(x => x.id === id);
}

function speakItem(item) {
  return new Promise(resolve => {
    if (item.pause !== undefined) {
      setTimeout(() => {
        elapsed += item.pause;
        updateProgress();
        resolve();
      }, item.pause * 1000);
      return;
    }

    const ut = new SpeechSynthesisUtterance(item.text);
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.startsWith("fr")) || voices[0];

    ut.voice = voice;

    // Mode = grave / normal / rapide
    if (item.mode === "grave") {
      ut.rate = 0.85;
      ut.pitch = 0.7;
    } else if (item.mode === "rapide") {
      ut.rate = 1.25;
      ut.pitch = 1.1;
    } else {
      ut.rate = 1.0;
      ut.pitch = 1.0;
    }

    ut.onend = () => {
      elapsed += Math.max(1.2, item.text.split(" ").length * 0.18);
      updateProgress();
      resolve();
    };

    utterance = ut;
    synth.speak(ut);
  });
}

async function playFrom(index) {
  if (!current) return;
  for (let i = index; i < current.script.length; i++) {
    currentIndex = i;
    const item = current.script[i];

    if (isPaused) {
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (!isPaused) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    }

    if (!synth.speaking) {
      await speakItem(item);
    }

    if (!current || !synth.speaking) {
      // continue
    }

    if (elapsed >= current.duree_totale_sec) break;
  }
}

btnPlay.addEventListener("click", async () => {
  if (!current) return;
  if (synth.speaking && isPaused) {
    isPaused = false;
    synth.resume();
    return;
  }
  if (synth.speaking) return;

  isPaused = false;
  await playFrom(currentIndex);
});

btnPause.addEventListener("click", () => {
  if (!synth.speaking) return;
  isPaused = true;
  synth.pause();
});

btnStop.addEventListener("click", () => {
  synth.cancel();
  isPaused = false;
  currentIndex = 0;
  elapsed = 0;
  updateProgress();
});

select.addEventListener("change", () => {
  const ex = findById(select.value);
  loadExercise(ex);
});

fetch("echauffements.json")
  .then(res => res.json())
  .then(json => {
    data = json.echauffements || [];
    if (!data.length) throw new Error("Aucun échauffement trouvé.");
    populateSelect();
    loadExercise(data[0]);
  })
  .catch(err => {
    console.error(err);
  });

