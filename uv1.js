

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

function normalizeCat(cat) {
  if (cat === "Sur trois pas") return "3pas";
  if (cat === "Sur place") return "surplace";
  if (cat === "Multidirectionnel") return "multi";
  if (cat === "Cibles") return "cibles";
  return cat;
}
function setUV1Background(cat) {
  const zone = document.getElementById("currentText");
  if (!zone) return;

  Object.values(BG_MAP).forEach(bg =>
    zone.classList.remove(bg)
  );

  const bgClass = BG_MAP[cat];
  if (bgClass) zone.classList.add(bgClass);
}

function resetBackground() {
  const zone = document.getElementById("currentText");
  if (!zone) return;

  Object.values(BG_MAP).forEach(bg =>
    zone.classList.remove(bg)
  );
}

async function loadUV1Data() {
  if (Object.keys(UV1_DATA).length) return;
 const res = await fetch("enchainements_propre.json");

  UV1_DATA = await res.json();
}

const waitMs = ms => new Promise(r => setTimeout(r, ms));

function pickRandom(cat, n = 1) {
  const label = CATEGORY_MAP[cat];
  const list = UV1_DATA[label] || [];
  if (!list.length) return n === 1 ? null : [];
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

function buildUV1Exam() {
  const seq = [];

  const p1 = pickRandom("3pas", 3);
  p1.forEach((ex, i) => seq.push({
  cat: "3pas",
  fr: ex.fr,
  jp_katakana: ex.jp_katakana,
  jp_romaji: ex.jp_romaji,
  time: 45,
  announce: i === 0 ? "Première partie. Enchaînements sur trois pas." : null
}));


  const p2 = pickRandom("surplace", 1);
  seq.push({
    cat: "surplace",
   fr: p2.fr,
jp_katakana: p2.jp_katakana,
jp_romaji: p2.jp_romaji,

    garde: "gauche",
    time: 30,
    announce: "Deuxième partie. Enchaînements sur place."
  });
  seq.push({
    cat: "surplace",
   fr: p2.fr,
jp_katakana: p2.jp_katakana,
jp_romaji: p2.jp_romaji,

    garde: "droite",
    time: 30
  });

  const p3 = pickRandom("multi", 1);
  seq.push({
    cat: "multi",
    fr: p3.fr,
jp_katakana: p3.jp_katakana,
jp_romaji: p3.jp_romaji,

    garde: "gauche",
    time: 45,
    announce: "Troisième partie. Multidirectionnel."
  });
  seq.push({
    cat: "multi",
   fr: p3.fr,
jp_katakana: p3.jp_katakana,
jp_romaji: p3.jp_romaji,

    garde: "droite",
    time: 45
  });

  const p4 = pickRandom("cibles", 5);
  p4.forEach((ex, i) => seq.push({
  cat: "cibles",
  fr: ex.fr,
  jp_katakana: ex.jp_katakana,
  jp_romaji: ex.jp_romaji,
  time: 30,
  announce: i === 0 ? "Quatrième partie. Travail sur cibles." : null
}));


  return seq;
}
async function speakJP(text) {
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.95;
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}

async function runUV1Sequence(sequence) {
  for (const ex of sequence) {
    if (stopped) return;

    setUV1Background(ex.cat); // ✅ ICI

    if (ex.announce) await speak(ex.announce);


   uv1Text.textContent = ex.fr;

    if (ex.jp_katakana && typeof speakJP === "function") {
  await speakJP(ex.jp_katakana);
}


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

async function runUV1Exam() {
  await loadUV1Data();

  uv1Text.textContent = "UV1 – Kihon";
  await speak("Unité de valeur un. Kihon.");
  await waitMs(1000);

  const seq = buildUV1Exam();
  await runUV1Sequence(seq);
}

window.runUV1Exam = runUV1Exam;

// Rendu global
window.runUV1Exam = runUV1Exam;
