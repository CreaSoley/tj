/* =========================
   SIMULATEUR GLOBAL UV — VERSION STABLE
   ========================= */

/* ---------- ÉTAT GLOBAL ---------- */
let paused = false;
let stopped = false;
let examMode = "full";
let uvQueue = [];
let currentUVIndex = 0;

/* ---------- DEBUG VISUEL ---------- */
function updateVisual(uv, label, nextUV = null) {
  const visual = document.getElementById("visual");
  const text = document.getElementById("text");

  if (text) text.textContent = `${uv} – ${label}`;

  if (visual) {
    visual.innerHTML = `
      <div>▶️ UV active : <strong>${uv}</strong></div>
      ${nextUV ? `<div>⏭️ UV suivante : ${nextUV}</div>` : ""}
    `;
    visual.style.outline = "3px dashed #ff1493";
  }
}

/* ---------- VOIX ---------- */
function speak(text, lang = "fr-FR", rate = 0.97) {
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}

/* ---------- STOP GLOBAL ---------- */
function stopAll() {
  stopped = true;
  paused = false;
  speechSynthesis.cancel();

  if (window.UV2) UV2.stop();
  if (window.UV56) {
    UV56.stopUV5();
    UV56.stopUV6();
  }

  document.getElementById("text").textContent = "Arrêté";
  document.getElementById("countdown").textContent = "00:00";
}

/* ---------- CANDIDAT ---------- */
function getCandidate() {
  return {
    name: document.getElementById("candidate")?.value || "candidat",
    title: document.getElementById("candidateTitle")?.value || "Monsieur"
  };
}

async function announceStart() {
  const c = getCandidate();
  await speak(`Passage de grade de ${c.title} ${c.name}`);
  await speak(`${c.title} ${c.name} avancez-vous`);
}

/* =========================
   UV DEFINITIONS
   ========================= */

const UV_RUNNERS = {

  async UV1(nextUV) {
    updateVisual("UV1", "Kihon", nextUV);
    await speak("Unité de valeur une : Kihon");
    await speak("Veuillez exécuter les enchaînements demandés");
    await window.runUV1Exam();
    await speak("Fin de l’unité de valeur Kihon");
  },

  async UV2(nextUV) {
    updateVisual("UV2", "Ippon Kumite", nextUV);

    await speak("Unité de valeur deux : Ippon Kumite");
    await speak("Les attaques ainsi que le niveau sont annoncés.");

    UV2.setStopCallback(async () => {
      if (stopped) return;
      document.getElementById("currentText").innerHTML = "";
      await speak("Fin de l’unité de valeur Ippon Kumite");
      runNextUV();
    });

    const interval = Number(document.getElementById("uv2-interval")?.value || 5);

    UV2.start(interval, (data) => {
      const display = document.getElementById("currentText");

      display.innerHTML = `
        <div style="font-size:1.6rem;font-weight:600">${data.romaji}</div>
        <div style="font-size:1.2rem;opacity:.8">${data.jp}</div>
      `;

      const u = new SpeechSynthesisUtterance(data.jp);
      u.lang = "ja-JP";
      speechSynthesis.speak(u);
    });
  },

  async UV3(nextUV) {
    updateVisual("UV3", "Kata", nextUV);
    await speak("Unité de valeur trois : Kata");
    await speak("Annoncez le kata que vous avez choisi");
    await window.runUV3Exam();
    await speak("Fin de l’unité de valeur Kata");
  },

  async UV4(nextUV) {
    updateVisual("UV4", "Épreuves techniques", nextUV);
    await speak("Unité de valeur quatre : Épreuves techniques");
    await window.runUV4Exam();
    await speak("Fin de l’unité de valeur Épreuves techniques");
  },

  async UV5(nextUV) {
    updateVisual("UV5", "Assauts imposés", nextUV);

    const count = +document.getElementById("uv5-count").value;
    const interval = +document.getElementById("uv5-interval").value;

    await speak("Unité de valeur cinq : Assauts imposés");
    await speak("Commencez");

    UV56.startUV5(interval, count, txt => speak(txt));

    setTimeout(async () => {
      if (stopped) return;
      UV56.stopUV5();
      await speak("Fin de l’unité de valeur Assauts imposés");
      runNextUV();
    }, count * interval * 1000);
  },

  async UV6() {
    updateVisual("UV6", "Randori", null);

    const count = +document.getElementById("uv6-count").value;
    const interval = +document.getElementById("uv6-interval").value;

    await speak("Unité de valeur six : Randori");
    await speak("Commencez");

    UV56.startUV6(interval, count, txt => speak(txt));

    setTimeout(async () => {
      if (stopped) return;
      UV56.stopUV6();
      await speak("Fin de l’examen");
    }, count * interval * 1000);
  }
};

/* =========================
   SCHEDULER UV UNIFIÉ
   ========================= */

async function runNextUV() {
  if (stopped) return;
  if (currentUVIndex >= uvQueue.length) return;

  const uv = uvQueue[currentUVIndex];
  const nextUV = uvQueue[currentUVIndex + 1] || null;
  currentUVIndex++;

  await UV_RUNNERS[uv](nextUV);
}

/* =========================
   BOUTON LANCER
   ========================= */

document.getElementById("startBtn").addEventListener("click", async () => {
  stopped = false;
  paused = false;
  currentUVIndex = 0;

  examMode = document.getElementById("examPreset").value;
  const singleUV = document.getElementById("singleUV").value;

  await announceStart();

  if (examMode === "single") {
    uvQueue = [singleUV];
  } else {
    uvQueue = Array.from(document.querySelectorAll("#uvOrderList li"))
      .map(li => li.dataset.uv);
  }

  runNextUV();
});

/* ---------- PAUSE / STOP ---------- */
document.getElementById("pauseBtn").addEventListener("click", () => paused = !paused);
document.getElementById("stopBtn").addEventListener("click", stopAll);
