/* ======================================================
   SIMULATEUR GLOBAL – CHEF D’ORCHESTRE
   ------------------------------------------------------
   - Gère : modes, ordre des UV, timers, pause, stop
   - Aucun UV ne gère de timer global
   - Les UV signalent la fin via callback
   ====================================================== */

/* ===================== ÉTAT GLOBAL ===================== */
let paused = false;
let stopped = false;
let currentUVIndex = 0;
let uvOrder = [];

let currentTimeout = null;

/* ===================== DOM ===================== */
const textEl = document.getElementById("text");
const countdownEl = document.getElementById("countdown");
const logEl = document.getElementById("log");
const modeBtn = document.getElementById("modeBtn");
const presetSelect = document.getElementById("presetSelect");
const pauseInput = document.getElementById("pauseDuration");

/* ===================== MODE ===================== */
let mode = "exam"; // exam | training

modeBtn.addEventListener("click", () => {
  mode = mode === "exam" ? "training" : "exam";
  modeBtn.textContent = mode === "exam"
    ? "Mode Examen"
    : "Mode Entraînement";
  modeBtn.classList.toggle("training", mode === "training");
});

/* ===================== UTILITAIRES ===================== */
function speak(txt) {
  return new Promise(resolve => {
    if (!txt) return resolve();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "fr-FR";
    u.rate = 0.97;
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}

function format(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ===================== TIMER GLOBAL ===================== */
async function runCountdown(seconds) {
  let t = seconds;
  countdownEl.textContent = format(t);

  while (t > 0) {
    if (stopped) return;
    if (!paused) {
      await wait(1000);
      t--;
      countdownEl.textContent = format(t);
    } else {
      await wait(300);
    }
  }
}

/* ===================== ORDRE DES UV ===================== */
function computeUVOrder() {
  const preset = presetSelect.value;

  if (mode === "exam") {
    return ["UV1", "UV2", "UV3", "UV4", "UV5", "UV6"];
  }

  if (preset === "adapt") {
    return ["UV1", "UV4", "UV2", "UV5", "UV1", "UV6"];
  }

  if (preset === "custom") {
    // pour l’instant : fallback simple
    return ["UV2", "UV3", "UV4"];
  }

  return ["UV1", "UV2", "UV3", "UV4", "UV5", "UV6"];
}

/* ===================== FIN D’UV ===================== */
async function onUVFinished() {
  if (stopped) return;

  await speak("Fin de l’unité de valeur.");
  await speak("Vous pouvez regagner votre place.");

  const pauseMin = Number(pauseInput.value || 0);
  if (pauseMin > 0) {
    await speak("Pause.");
    await runCountdown(pauseMin * 60);
  }

  currentUVIndex++;
  runNextUV();
}

/* ===================== DISPATCH UV ===================== */
function runNextUV() {
  if (stopped) return;

  if (currentUVIndex >= uvOrder.length) {
    textEl.textContent = "Examen terminé";
    speak("Examen terminé. Félicitations.");
    return;
  }

  const uv = uvOrder[currentUVIndex];
  textEl.textContent = uv;
  logEl.textContent = `En cours : ${uv}`;

  switch (uv) {
    case "UV1":
      runUV1Exam().then(onUVFinished);
      break;

    case "UV2":
      speak("Unité de valeur deux. Ippon kumité.");
      UV2.setStopCallback(onUVFinished);
      UV2.start(4, speakJP);
      break;

    case "UV3":
      runUV3Exam(onUVFinished);
      break;

    case "UV4":
      runUV4Exam(onUVFinished);
      break;

    case "UV5":
      UV56.startUV5(4, 6);
      currentTimeout = setTimeout(onUVFinished, 4 * 6 * 1000 + 1000);
      break;

    case "UV6":
      UV56.startUV6(4, 8);
      currentTimeout = setTimeout(onUVFinished, 4 * 8 * 1000 + 1000);
      break;

    default:
      onUVFinished();
  }
}

/* ===================== VOIX JP (UV2) ===================== */
function speakJP(txt) {
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "ja-JP";
    u.rate = 0.95;
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}

/* ===================== CONTRÔLES ===================== */
document.getElementById("startBtn").addEventListener("click", () => {
  stopped = false;
  paused = false;
  currentUVIndex = 0;
  uvOrder = computeUVOrder();
  logEl.textContent = "Ordre : " + uvOrder.join(" → ");
  runNextUV();
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  paused = !paused;
  logEl.textContent = paused ? "Pause" : "Reprise";
});

document.getElementById("stopBtn").addEventListener("click", () => {
  stopped = true;
  paused = false;
  speechSynthesis.cancel();
  if (currentTimeout) clearTimeout(currentTimeout);
  logEl.textContent = "Arrêté";
});
