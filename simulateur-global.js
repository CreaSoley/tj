/* =========================
   SIMULATEUR GLOBAL UV — VERSION CORRIGÉE STABLE
   ========================= */

/* ---------- ÉTAT GLOBAL ---------- */
let paused = false;
let stopped = false;
let examMode = "full";
let uvQueue = [];
let currentUVIndex = 0;

/* ---------- AFFICHAGE ---------- */
function updateVisual(uv, label, nextUV = null) {
  const visual = document.getElementById("visual");
  const text = document.getElementById("text");

  if (text) text.textContent = `Examen en cours — ${uv} (${label})`;

  if (visual) {
    visual.innerHTML = `
      <div>▶️ UV active : <strong>${uv}</strong></div>
      ${nextUV ? `<div>⏭️ UV suivante : ${nextUV}</div>` : ""}
    `;
    visual.style.outline = "3px dashed #ff1493";
  }
}

function setDisplay({ main = "", sub = "", clear = false } = {}) {
  const el = document.getElementById("currentText");
  if (!el) return;
  if (clear) el.innerHTML = "";
  if (main) el.innerHTML = `<div class="main-text">${main}</div>`;
  if (sub) el.innerHTML += `<div class="sub-text">${sub}</div>`;
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

async function speakAndShow(text, displayText = text) {
  setDisplay({ main: displayText, clear: true });
  await speak(text);
}

/* ---------- STOP ---------- */
function stopAll() {
  stopped = true;
  paused = false;
  speechSynthesis.cancel();

  if (window.UV2) UV2.stop();
  if (window.UV56) {
    UV56.stopUV5();
    UV56.stopUV6();
  }

  setDisplay({ main: "⛔ Examen arrêté", clear: true });
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
  await speakAndShow(`Passage de grade de ${c.title} ${c.name}`);
  await speakAndShow(`${c.title} ${c.name}, avancez-vous`);
}

/* =========================
   UV RUNNERS
   ========================= */

const UV_RUNNERS = {

  /* ---------- UV1 ---------- */
  async UV1(nextUV) {
    updateVisual("UV1", "Kihon", nextUV);

    await speakAndShow("Unité de valeur une : Kihon");
    await speakAndShow("Exécutez les enchaînements demandés");

    setDisplay({
      main: "Kihon fondamentaux",
      sub: "Travail libre sur consignes du jury",
      clear: true
    });

    await window.runUV1Exam();

    await speakAndShow("Fin de l’unité de valeur Kihon");
    runNextUV();
  },

  /* ---------- UV2 ---------- */
  async UV2(nextUV) {
    updateVisual("UV2", "Ippon Kumite", nextUV);

    await speakAndShow("Unité de valeur deux : Ippon Kumite");
    await speakAndShow("Les attaques sont annoncées");

    setDisplay({
      main: "Attaque annoncée",
      sub: "Préparez-vous",
      clear: true
    });

    UV2.setStopCallback(async () => {
      if (stopped) return;
      await speakAndShow("Fin de l’unité de valeur Ippon Kumite");
      runNextUV();
    });

    const interval = Number(document.getElementById("uv2-interval")?.value || 5);

    UV2.start(interval, data => {
      setDisplay({
        main: data.romaji,
        sub: data.jp,
        clear: true
      });

      const u = new SpeechSynthesisUtterance(data.jp);
      u.lang = "ja-JP";
      speechSynthesis.speak(u);
    });
  },

  /* ---------- UV3 (KATA + BUNKAI) ---------- */
  async UV3(nextUV) {
    updateVisual("UV3", "Kata", nextUV);

    const kataTime = Number(document.getElementById("uv3-kata-time")?.value || 60);
    const bunkaiTime = Number(document.getElementById("uv3-bunkai-time")?.value || 60);

    await speakAndShow("Unité de valeur trois : Kata");
    await speakAndShow("Annoncez le kata choisi");

    setDisplay({
      main: "Kata",
      sub: "Exécution du kata",
      clear: true
    });

    await new Promise(res => setTimeout(res, kataTime * 1000));

    await speakAndShow("Préparez le bunkai");

    setDisplay({
      main: "Bunkai",
      sub: "Applications martiales",
      clear: true
    });

    await new Promise(res => setTimeout(res, bunkaiTime * 1000));

    await speakAndShow("Fin de l’unité de valeur Kata");
    runNextUV();
  },

  /* ---------- UV4 ---------- */
  async UV4(nextUV) {
    updateVisual("UV4", "Épreuves techniques", nextUV);

    await speakAndShow("Unité de valeur quatre : Épreuves techniques");

    setDisplay({
      main: "Techniques imposées",
      sub: "Selon les consignes du jury",
      clear: true
    });

    await window.runUV4Exam();

    await speakAndShow("Fin de l’unité de valeur Épreuves techniques");
    runNextUV();
  },

  /* ---------- UV5 ---------- */
  async UV5(nextUV) {
    updateVisual("UV5", "Assauts imposés", nextUV);

    const count = +document.getElementById("uv5-count").value;
    const interval = +document.getElementById("uv5-interval").value;

    await speakAndShow("Unité de valeur cinq : Assauts imposés");
    await speakAndShow("Commencez");

    setDisplay({
      main: "Attaque en cours",
      sub: "Répondez à l'annonce",
      clear: true
    });

    UV56.startUV5(interval, count, txt => speak(txt));

    setTimeout(async () => {
      if (stopped) return;
      UV56.stopUV5();
      await speakAndShow("Fin de l’unité de valeur Assauts imposés");
      runNextUV();
    }, count * interval * 1000);
  },

  /* ---------- UV6 ---------- */
  async UV6() {
    updateVisual("UV6", "Randori", null);

    const count = +document.getElementById("uv6-count").value;
    const interval = +document.getElementById("uv6-interval").value;

    await speakAndShow("Unité de valeur six : Randori");
    await speakAndShow("Commencez");

    setDisplay({
      main: "Randori",
      sub: "Combat libre",
      clear: true
    });

    UV56.startUV6(interval, count, txt => speak(txt));

    setTimeout(async () => {
      if (stopped) return;
      UV56.stopUV6();
      await speakAndShow("Fin de l’examen");
    }, count * interval * 1000);
  }
};

/* =========================
   SCHEDULER UV
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
   BOUTONS
   ========================= */

document.getElementById("startBtn").addEventListener("click", async () => {
  stopped = false;
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

document.getElementById("stopBtn").addEventListener("click", stopAll);
