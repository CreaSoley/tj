/* =========================
   UV1 – KIHON BLINDÉ + DEBUG
   ========================= */

const uv1Text = document.getElementById("currentText");
const uv1Timer = document.getElementById("timer");

let UV1_DATA = {};

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

async function loadUV1Data() {
  if (Object.keys(UV1_DATA).length) return;
  try {
    const res = await fetch("enchainements_propres.json", { cache: "no-store" });
    UV1_DATA = await res.json();
    console.log("UV1_DATA chargées :", UV1_DATA);
  } catch (e) {
    console.error("Impossible de charger le JSON UV1 :", e);
    UV1_DATA = {};
  }
}

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

function safeList(cat) {
  const label = CATEGORY_MAP[cat];
  const list = Array.isArray(UV1_DATA[label]) ? UV1_DATA[label] : [];
  if (!list.length) console.warn(`Catégorie vide ou introuvable : ${cat}`);
  return list;
}

function pickRandom(cat, n = 1) {
  const list = safeList(cat);
  if (!list.length) return n === 1 ? null : [];
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

function pushSafe(seq, ex) {
  if (!ex) return;
  seq.push({
    cat: ex.cat || "3pas",
    fr: ex.fr || " ",
    jp_katakana: ex.jp_katakana || "",
    jp_romaji: ex.jp_romaji || "",
    time: ex.time || 30,
    garde: ex.garde || null,
    announce: ex.announce || null
  });
}

function buildUV1Exam() {
  const seq = [];

  const p1 = pickRandom("3pas", 3);
  (p1 || []).forEach((ex, i) => pushSafe(seq, {
    ...ex,
    cat: "3pas",
    time: 45,
    announce: i === 0 ? "Première partie. Enchaînements sur trois pas." : null
  }));

  const p2 = pickRandom("surplace");
  pushSafe(seq, {
    ...p2,
    cat: "surplace",
    garde: "gauche",
    time: 30,
    announce: "Deuxième partie. Enchaînements sur place."
  });
  pushSafe(seq, {
    ...p2,
    cat: "surplace",
    garde: "droite",
    time: 30
  });

  const p3 = pickRandom("multi");
  pushSafe(seq, {
    ...p3,
    cat: "multi",
    garde: "gauche",
    time: 45,
    announce: "Troisième partie. Multidirectionnel."
  });
  pushSafe(seq, {
    ...p3,
    cat: "multi",
    garde: "droite",
    time: 45
  });

  const p4 = pickRandom("cibles", 5);
  (p4 || []).forEach((ex, i) => pushSafe(seq, {
    ...ex,
    cat: "cibles",
    time: 30,
    announce: i === 0 ? "Quatrième partie. Travail sur cibles." : null
  }));

  console.log("Séquence UV1 construite :", seq);
  return seq;
}

async function runUV1Sequence(sequence) {
  for (const ex of sequence) {
    if (stopped) return;

    setUV1Background(ex.cat);

    if (ex.announce) await speak(ex.announce);

    uv1Text.textContent = ex.fr || "Enchaînement non disponible";

    await speakJP(ex.jp_katakana);
    await speak(ex.fr || " ");

    if (ex.garde) await speak("Garde à " + ex.garde);

    await speak("Hajimé");

    let t = ex.time || 30;
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

async function runUV1Exam() {
  await loadUV1Data();

  uv1Text.textContent = "UV1 – Kihon";
  await speak("Unité de valeur un. Kihon.");
  await waitMs(1000);

  const seq = buildUV1Exam();
  if (!seq.length) {
    await speak("Aucun enchaînement disponible. Vérifiez le JSON.");
    console.warn("UV1 : séquence vide !");
    return;
  }

  await runUV1Sequence(seq);
}

window.runUV1Exam = runUV1Exam;
