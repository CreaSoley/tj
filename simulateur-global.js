/* =========================================================
   SIMULATEUR GLOBAL – VERSION FINALE STABLE
   Compatible avec :
   - uv2-exam.js
   - uv3-exam.js
   - uv4-exam.js
   - uv56-exam.js (INCHANGÉ)
   ========================================================= */

/* ===================== ÉTAT GLOBAL ===================== */
let paused = false;
let stopped = false;
let timerInterval = null;
let remaining = 0;

/* ===================== UI ===================== */
const textEl = document.getElementById("text");
const countdownEl = document.getElementById("countdown");

/* ===================== VOIX ===================== */
function speak(text) {
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.97;
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}

/* ===================== TIMER ===================== */
function format(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function startCountdown(seconds, onEnd) {
  clearInterval(timerInterval);
  remaining = seconds;
  countdownEl.textContent = format(remaining);

  timerInterval = setInterval(() => {
    if (paused || stopped) return;
    remaining--;
    countdownEl.textContent = format(remaining);
    if (remaining <= 0) {
      clearInterval(timerInterval);
      onEnd && onEnd();
    }
  }, 1000);
}

/* ===================== CONTROLES ===================== */
window.togglePause = () => paused = !paused;

window.stopExam = () => {
  stopped = true;
  paused = false;
  clearInterval(timerInterval);
  speechSynthesis.cancel();
  if (window.UV2) UV2.stop();
  if (window.UV56) {
    UV56.stopUV5();
    UV56.stopUV6();
  }
  textEl.textContent = "Arrêté";
  countdownEl.textContent = "00:00";
};

/* ===================== PAUSE ENTRE UV ===================== */
async function pauseBetweenUV() {
  const pauseMin = Number(document.getElementById("pauseDuration").value) || 0;
  if (pauseMin <= 0) return;
  textEl.textContent = "Pause";
  await speak("Pause");
  return new Promise(r => setTimeout(r, pauseMin * 60000));
}

/* =========================================================
   ======================= UV2 =============================
   ========================================================= */
async function runUV2() {
  textEl.textContent = "UV2 – Ippon Kumite";

  await speak("Unité de valeur deux. Ippon kumite.");
  await speak("Les deux candidats sont en garde. Les attaques ainsi que le niveau sont annoncés.");
  await speak("A chaque fois, les attaques et les contre-attaques devront être différentes.");
  await speak("Le test est composé de deux séries de cinq attaques, exécutées d’abord à droite puis à gauche.");

  const interval = Number(document.getElementById("uv2-interval")?.value) || 5;
  const duration = interval * 10;

  startCountdown(duration, async () => {
    await speak("Fin de l’unité de valeur Ippon kumite");
    await speak("Vous pouvez regagner votre place");
    nextUV();
  });

  UV2.start(interval, txt => {
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "ja-JP";
    speechSynthesis.speak(u);
  });
}

/* =========================================================
   ======================= UV3 =============================
   ========================================================= */
async function runUV3() {
  textEl.textContent = "UV3 – Kata";

  const kataMin = Number(document.getElementById("uv3-kata")?.value) || 2;
  const bunkaiMin = Number(document.getElementById("uv3-bunkai")?.value) || 2;

  await speak("Unité de valeur trois. Kata.");
  await speak("Annoncez le kata que vous avez choisi.");

  startCountdown(kataMin * 60, async () => {
    await speak("Présentez les bunkaïs choisis et les séquences du kata de référence.");

    startCountdown(bunkaiMin * 60, async () => {
      await speak("Fin de l’unité de valeur kata");
      await speak("Vous pouvez regagner votre place");
      nextUV();
    });
  });
}

/* =========================================================
   ======================= UV4 =============================
   ========================================================= */
async function runUV4() {
  textEl.textContent = "UV4 – Épreuves techniques";

  await speak("Unité de valeur quatre. Épreuves techniques.");
  await speak("Exécutez trois applications sur saisie à droite ou à gauche.");
  await speak("Annoncez la technique de base choisie.");

  const duration = Number(document.getElementById("uv4-duration")?.value) || 180;

  startCountdown(duration, async () => {
    await speak("Fin de l’unité de valeur épreuves techniques");
    await speak("Vous pouvez regagner votre place");
    nextUV();
  });
}

/* =========================================================
   ======================= UV5 =============================
   ========================================================= */
async function runUV5() {
  textEl.textContent = "UV5 – Assauts imposés";

  const count = Number(document.getElementById("uv5-count")?.value) || 5;
  const interval = Number(document.getElementById("uv5-interval")?.value) || 15;
  const duration = count * interval;

  await speak("Unité de valeur cinq. Assauts imposés.");

  UV56.startUV5(interval, count, speak);

  startCountdown(duration, async () => {
    UV56.stopUV5();
    await speak("Fin de l’unité de valeur assauts imposés");
    await speak("Vous pouvez regagner votre place");
    nextUV();
  });
}

/* =========================================================
   ======================= UV6 =============================
   ========================================================= */
async function runUV6() {
  textEl.textContent = "UV6 – Randori";

  const count = Number(document.getElementById("uv6-count")?.value) || 5;
  const interval = Number(document.getElementById("uv6-interval")?.value) || 15;
  const duration = count * interval;

  await speak("Unité de valeur six. Randori.");

  UV56.startUV6(interval, count, speak);

  startCountdown(duration, async () => {
    UV56.stopUV6();
    await speak("Fin de l’unité de valeur randori");
    await speak("Vous pouvez regagner votre place");
    nextUV();
  });
}

/* =========================================================
   ================== ORCHESTRATION ========================
   ========================================================= */
const ORDER = ["UV2", "UV3", "UV4", "UV5", "UV6"];
let uvIndex = 0;

async function nextUV() {
  if (stopped || uvIndex >= ORDER.length) {
    await speak("Fin de l'examen. Vous pouvez regagner votre place.");
    textEl.textContent = "Terminé";
    return;
  }

  await pauseBetweenUV();

  const uv = ORDER[uvIndex++];
  if (uv === "UV2") runUV2();
  if (uv === "UV3") runUV3();
  if (uv === "UV4") runUV4();
  if (uv === "UV5") runUV5();
  if (uv === "UV6") runUV6();
}

/* ===================== LANCEMENT ===================== */
window.startExam = async () => {
  stopped = false;
  paused = false;
  uvIndex = 0;
  textEl.textContent = "Début examen";
  await speak("Début de l'examen.");
  nextUV();
};
