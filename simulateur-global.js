/* ==========================
   simulateur-global.js
   Version minimum viable
   ========================== */

const UVS = [
  { id: "UV1", name: "Kihon" },
  { id: "UV2", name: "Ippon Kumite" },
  { id: "UV3", name: "Kata" },
  { id: "UV4", name: "Épreuves techniques" },
  { id: "UV5", name: "Assauts imposés" },
  { id: "UV6", name: "Randori" }
];

let paused = false;
let stopped = false;
let uvIndex = 0;
let sequence = [];
let timerInterval = null;
let remaining = 0;

function speak(text) {
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
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

function updateTimerDisplay(sec) {
  document.getElementById("countdown").textContent = format(sec);
}

function startTimer(durationSec, onEnd) {
  clearInterval(timerInterval);
  remaining = durationSec;
  updateTimerDisplay(remaining);

  timerInterval = setInterval(() => {
    if (paused || stopped) return;
    remaining--;
    updateTimerDisplay(remaining);
    if (remaining <= 0) {
      clearInterval(timerInterval);
      onEnd();
    }
  }, 1000);
}

function stopAll() {
  stopped = true;
  paused = false;
  clearInterval(timerInterval);
  speechSynthesis.cancel();
  if (window.UV2) UV2.stop();
  if (window.UV56) {
    UV56.stopUV5();
    UV56.stopUV6();
  }
  document.getElementById("text").textContent = "Arrêté";
  document.getElementById("countdown").textContent = "00:00";
}

async function pauseBetweenUV() {
  const pauseMin = Number(document.getElementById("pauseDuration").value) || 0;
  if (pauseMin <= 0) return;
  document.getElementById("text").textContent = "Pause";
  await speak("Pause");
  return new Promise(r => setTimeout(r, pauseMin * 60000));
}

/* ==========================
   RUN UV FUNCTIONS
   ========================== */

async function runUV1() {
  document.getElementById("text").textContent = "UV1 – Kihon";
  await speak("UV1 : Kihon");
  await window.runUV1Exam(); // UV1 doit être dans uv1-exam.js
  nextUV();
}

async function runUV2() {
  document.getElementById("text").textContent = "UV2 – Ippon Kumite";

  await speak("Unité de valeur : Ippon kumite");
  await speak("Les deux candidats sont en garde. Les attaques ainsi que le niveau sont annoncés.");
  await speak("A chaque fois, les attaques et les contre-attaques devront être différentes.");
  await speak("Le test sera composé de deux séries des 5 attaques suivantes, exécutées d’abord à droite puis à gauche.");

  const interval = Number(document.getElementById("uv2-interval").value) || 5;

  // Callback when UV2 finished
  UV2.setStopCallback(() => {
    nextUV();
  });

  UV2.start(interval, (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    speechSynthesis.speak(u);
  });
}

async function runUV3() {
  document.getElementById("text").textContent = "UV3 – Kata";

  const kataMin = Number(document.getElementById("uv3-kata").value) || 2;
  const bunkaiMin = Number(document.getElementById("uv3-bunkai").value) || 2;

  await speak("Unité de valeur : kata");
  await speak("Annoncez le kata que vous avez choisi.");

  startTimer(kataMin * 60, async () => {
    await speak("Présentez les bunkaïs choisis et les séquences du kata de référence.");

    startTimer(bunkaiMin * 60, async () => {
      nextUV();
    });
  });
}

async function runUV4() {
  document.getElementById("text").textContent = "UV4 – Épreuves techniques";

  await speak("Unité de valeur : épreuves techniques");
  await speak("Exécutez 3 applications sur saisie à droite ou à gauche");
  await speak("Annoncez la technique de base choisie");

  const duration = Number(document.getElementById("uv4-duration").value) || 180;

  startTimer(duration, () => nextUV());
}

async function runUV5() {
  document.getElementById("text").textContent = "UV5 – Assauts imposés";

  const count = Number(document.getElementById("uv5-count").value) || 5;
  const interval = Number(document.getElementById("uv5-interval").value) || 15;

  UV56.startUV5(interval, count, (txt) => speak(txt));
  startTimer(count * interval, () => {
    UV56.stopUV5();
    nextUV();
  });
}

async function runUV6() {
  document.getElementById("text").textContent = "UV6 – Randori";

  const count = Number(document.getElementById("uv6-count").value) || 5;
  const interval = Number(document.getElementById("uv6-interval").value) || 15;

  UV56.startUV6(interval, count, (txt) => speak(txt));
  startTimer(count * interval, () => {
    UV56.stopUV6();
    nextUV();
  });
}

/* ==========================
   NEXT UV SEQUENCE
   ========================== */

let order = ["UV1","UV2","UV3","UV4","UV5","UV6"];

function nextUV() {
  if (stopped) return;

  if (uvIndex >= order.length) {
    speak("Fin de l'examen. Vous pouvez regagner votre place.");
    document.getElementById("text").textContent = "Terminé";
    return;
  }

  pauseBetweenUV().then(() => {
    const uv = order[uvIndex++];
    if (uv === "UV1") runUV1();
    if (uv === "UV2") runUV2();
    if (uv === "UV3") runUV3();
    if (uv === "UV4") runUV4();
    if (uv === "UV5") runUV5();
    if (uv === "UV6") runUV6();
  });
}

/* ==========================
   BUTTONS
   ========================== */

document.getElementById("startBtn").addEventListener("click", () => {
  stopped = false;
  paused = false;
  uvIndex = 0;
  order = ["UV1","UV2","UV3","UV4","UV5","UV6"]; // mode examen fixe
  nextUV();
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  paused = !paused;
});

document.getElementById("stopBtn").addEventListener("click", () => {
  stopAll();
});
