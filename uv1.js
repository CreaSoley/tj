/* =========================
   UV1 – KIHON (VERSION BLINDÉE)
   ========================= */

const uv1Text = document.getElementById("currentText");
const uv1Timer = document.getElementById("timer");

let UV1_DATA = {};

/* =========================
   CONFIG
   ========================= */

const CATEGORY_MAP = {
  "3pas": "Sur trois pas",
  "surplace": "Sur place",
  "multi": "Multidirectionnel",
  "cibles": "Cibles"
};

const BG_MAP = {
  "3pas": "bg-3pas",
  "surplace": "bg-surplace",
  "multi": "bg-multi",
  "cibles": "bg-cibles"
};

/* =========================
   BACKGROUND
   ========================= */

function setUV1Background(cat) {
  const zone = document.getElementById("currentText");
  if (!zone) return;

  Object.values(BG_MAP).forEach(bg => zone.classList.remove(bg));
  if (BG_MAP[cat]) zone.classList.add(BG_MAP[cat]);
}

function resetBackground() {
  const zone = document.getElementById("currentText");
  if (!zone) return;

  Object.values(BG_MAP).forEach(bg => zone.classList.remove(bg));
}

/* =========================
   DATA
   ========================= */

async function loadUV1Data() {
  if (Object.keys(UV1_DATA).length) return;

  try {
    const res = await fetch("enchainements_propres.json");
    UV1_DATA = await res.json();
  } catch (e) {
    console.warn("UV1 : impossible de charger les données", e);
    UV1_DATA = {};
  }
}

function safeList(cat) {
  const label = CATEGORY_MAP[cat];
  return Array.isArray(UV1_DATA[label]) ? UV1_DATA[label] : [];
}

function pickRandom(cat, n = 1) {
  const list = safeList(cat);
  if (!list.length) return n === 1 ? null : [];

  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

/* =========================
   UTILS
   ========================= */

const waitMs = ms => new Promise(r => setTimeout(r, ms));

async function speakJP(text) {
  if (!text) return;
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.95;
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}

/* =========================
   BUILD SEQUENCE (SAFE)
   ========================= */

function pushSafe(seq, ex) {
  if (!ex) return;
  seq.push({
    cat: ex.cat,
    fr: ex.fr || " ",
    jp_katakana: ex.jp_katakana || "",
    time: ex.time || 30,
    garde: ex.garde || null,
    announce: ex.announce || null
  });
}

function buildUV1Exam() {
  const seq = [];

  pickRandom("3pas", 3).forEach((ex, i) =>
    pushSafe(seq, {
      cat: "3pas",
      fr: ex?.fr,
      jp_katakana: ex?.jp_katakana,
      time: 45,
      announce: i === 0
        ? "Première partie. Enchaînements sur trois pas."
        : null
    })
  );

  const p2 = pickRandom("surplace");
  pushSafe(seq, {
    cat: "surplace",
    fr: p2?.fr,
    jp_katakana: p2?.jp_katakana,
    garde: "gauche",
    time: 30,
    announce: "Deuxième partie. Enchaînements sur place."
  });
  pushSafe(seq, {
    cat: "surplace",
    fr: p2?.fr,
    jp_katakana: p2?.jp_katakana,
    garde: "droite",
    time: 30
  });

  const p3 = pickRandom("multi");
  pushSafe(seq, {
    cat: "multi",
    fr: p3?.fr,
    jp_katakana: p3?.jp_katakana,
    garde: "gauche",
    time: 45,
    announce: "Troisième partie. Multidirectionnel."
  });
  pushSafe(seq, {
    cat: "multi",
    fr: p3?.fr,
    jp_katakana: p3?.jp_katakana,
    garde: "droite",
    time: 45
  });

  pickRandom("cibles", 5).forEach((ex, i) =>
    pushSafe(seq, {
      cat: "cibles",
      fr: ex?.fr,
      jp_katakana: ex?.jp_katakana,
      time: 30,
      announce: i === 0
        ? "Quatrième partie. Travail sur cibles."
        : null
    })
  );

  return seq;
}

/* =========================
   RUN
   ========================= */

async function runUV1Sequence(sequence) {
  for (const ex of sequence) {
    if (stopped) return;

    setUV1Background(ex.cat);

    if (ex.announce) await speak(ex.announce);

    uv1Text.textContent = ex.fr;

    await speakJP(ex.jp_katakana);
    await speak(ex.fr);
    await speak(ex.fr);

    if (ex.garde) await speak("Garde à " + ex.garde);
    await speak("Hajimé");

    let t = ex.time;
    uv1Timer.textContent = format(t);

    while (t > 0) {
      if (stopped) return;
      if (!paused) {
        await waitMs(1000);
        t--;
        uv1Timer.textContent = format(t);
      } else {
        await waitMs(300);
      }
    }
  }
}

/* =========================
   PUBLIC API
   ========================= */

async function runUV1Exam() {
  await loadUV1Data();

  uv1Text.textContent = "UV1 – Kihon";
  await speak("Unité de valeur un. Kihon.");
  await waitMs(1000);

  const seq = buildUV1Exam();
  if (!seq.length) {
    await speak("Aucun enchaînement disponible.");
    return;
  }

  await runUV1Sequence(seq);
}

window.runUV1Exam = runUV1Exam;
