/* =========================
   Simulateur Global UV
   ========================= */

let paused = false;
let stopped = false;
let uvIndex = 0;

let order = ["UV1","UV2","UV3","UV4","UV5","UV6"];
let timerInterval = null;

/* =========================
   UTILITAIRES
   ========================= */

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

async function runCountdown(seconds) {
  return new Promise(resolve => {
    let remaining = seconds;
    updateTimerDisplay(remaining);

    const interval = setInterval(() => {
      if (stopped) {
        clearInterval(interval);
        return resolve();
      }
      if (!paused) {
        remaining--;
        updateTimerDisplay(remaining);
      }
      if (remaining <= 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
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

/* =========================
   Annonces officielles
   ========================= */

function getCandidate() {
  const name = document.getElementById("candidate")?.value || "candidat";
  const title = document.getElementById("candidateTitle")?.value || "Monsieur";
  return { name, title };
}

async function announceStart() {
  const candidate = getCandidate();
  await speak(`Passage de grade de ${candidate.title} ${candidate.name}`);
  await new Promise(r => setTimeout(r, 3000));
  await speak(`${candidate.title} ${candidate.name} avancez-vous !`);
}

/* =========================
   UV RUNNERS
   ========================= */

async function runUV1() {
  document.getElementById("text").textContent = "UV1 – Kihon";

  await speak("Unité de valeur une: Kihon");
  await speak("Veuillez exécuter les enchaînements demandés");

  await window.runUV1Exam();

  await speak("Fin de l’unité de valeur Kihon");
  await speak("Vous pouvez regagner votre place");

  nextUV();
}

async function runUV2() {
  document.getElementById("text").textContent = "UV2 – Ippon Kumite";

  await speak("Unité de valeur deux : Ippon Kumite");
  await speak("Les deux candidats sont en garde. Les attaques ainsi que le niveau sont annoncés.");
  await speak("À chaque fois, les attaques et les contre-attaques devront être différentes.");
  await speak("Le test sera composé de deux séries des 5 attaques suivantes, exécutées d’abord à droite puis à gauche.");

  const uv2IntervalEl = document.getElementById("uv2-interval");
   const uv2IntervalDisplay = document.getElementById("uv2-interval-display");

uv2IntervalEl.addEventListener("input", () => {
  uv2IntervalDisplay.textContent = `${uv2IntervalEl.value} sec`;
});


  UV2.setStopCallback(async () => {
    if (stopped) return;
    await speak("Fin de l’unité de valeur Ippon Kumite");
    await speak("Vous pouvez regagner votre place");
    nextUV();
  });

const intervalInput = document.getElementById("uv2-interval");
const interval = intervalInput ? Number(intervalInput.value) : 5;

UV2.start(interval, (text) => {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  speechSynthesis.speak(u);
});

async function runUV3() {
  document.getElementById("text").textContent = "UV3 – Kata";

  await speak("Unité de valeur trois : Kata");
  await speak("Annoncez le kata que vous avez choisi.");
  await speak("Vous pouvez commencer.");

  await window.runUV3Exam(async () => {
    if (stopped) return;
  
    await speak("Vous pouvez regagner votre place");
    nextUV();
  });
}

async function runUV4() {
  document.getElementById("text").textContent = "UV4 – Épreuves techniques";

  await speak("Unité de valeur : Épreuves techniques");
  await speak("Veuillez exécuter les épreuves techniques demandées");

  await window.runUV4Exam(async () => {
    if (stopped) return;
    await speak("Fin de l’unité de valeur Épreuves techniques");
    await speak("Vous pouvez regagner votre place");
    nextUV();
  });
}

async function runUV5() {
  document.getElementById("text").textContent = "UV5 – Assauts imposés";

  const count = Number(document.getElementById("uv5-count")?.value) || 5;
  const interval = Number(document.getElementById("uv5-interval")?.value) || 15;

  await speak("Unité de valeur : Assauts imposés");
  await speak(`Vous allez exécuter ${count} assauts imposés.`);
  await speak(`Le temps entre chaque assaut est de ${interval} secondes.`);
  await speak("Commencez.");

  UV56.startUV5(interval, count, (txt) => speak(txt));

  setTimeout(async () => {
    if (stopped) return;
    UV56.stopUV5();
    await speak("Fin de l’unité de valeur Assauts imposés");
    await speak("Vous pouvez regagner votre place");
    nextUV();
  }, count * interval * 1000);
}

async function runUV6() {
  document.getElementById("text").textContent = "UV6 – Randori";

  const count = Number(document.getElementById("uv6-count")?.value) || 5;
  const interval = Number(document.getElementById("uv6-interval")?.value) || 15;

  await speak("Unité de valeur : Randori");
  await speak(`Vous allez exécuter ${count} randoris.`);
  await speak(`Le temps entre chaque randori est de ${interval} secondes.`);
  await speak("Commencez.");

  UV56.startUV6(interval, count, (txt) => speak(txt));

  setTimeout(async () => {
    if (stopped) return;
    UV56.stopUV6();
    await speak("Fin de l’unité de valeur Randori");
    await speak("Vous pouvez regagner votre place");
    nextUV();
  }, count * interval * 1000);
}

/* =========================
   SEQUENCE UV
   ========================= */

function nextUV() {
  if (stopped) return;

  if (uvIndex >= order.length) {
    speak("Fin de l'examen. Vous pouvez regagner votre place.");
    document.getElementById("text").textContent = "Terminé";
    return;
  }

  const uv = order[uvIndex++];
  if (uv === "UV1") runUV1();
  if (uv === "UV2") runUV2();
  if (uv === "UV3") runUV3();
  if (uv === "UV4") runUV4();
  if (uv === "UV5") runUV5();
  if (uv === "UV6") runUV6();
}

/* =========================
   BOUTONS
   ========================= */

document.getElementById("startBtn").addEventListener("click", async () => {
  stopped = false;
  paused = false;
  uvIndex = 0;

  await announceStart();
  nextUV();
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  paused = !paused;
});

document.getElementById("stopBtn").addEventListener("click", () => {
  stopAll();
});
