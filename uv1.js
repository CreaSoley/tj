/* =========================
   UV1 Blindée Examen
   ========================= */

const uv1Text = document.getElementById("currentText");
const uv1Timer = document.getElementById("timer");
const translationText = document.getElementById("log"); // zone traduction

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

// 🌟 Fonctions utilitaires
function setUV1Background(cat) {
  const zone = uv1Text;
  if (!zone) return;
  Object.values(BG_MAP).forEach(bg => zone.classList.remove(bg));
  const bgClass = BG_MAP[cat];
  if (bgClass) zone.classList.add(bgClass);
}

function resetBackground() {
  const zone = uv1Text;
  if (!zone) return;
  Object.values(BG_MAP).forEach(bg => zone.classList.remove(bg));
}

const waitMs = ms => new Promise(r => setTimeout(r, ms));

async function speakJP(text, rate = 0.7, repeat = 2) {
  for (let i = 0; i < repeat; i++) {
    await new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.rate = rate;
      u.onend = resolve;
      speechSynthesis.speak(u);
    });
    // petite pause entre répétitions
    if (i < repeat - 1) await waitMs(300);
  }
}

async function speakFR(text) {
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 1;
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}

// 🌟 Chargement JSON
async function loadUV1Data() {
  if (Object.keys(UV1_DATA).length) return;
  try {
    const res = await fetch("enchainements_propre.json");
    UV1_DATA = await res.json();
  } catch (err) {
    console.error("Impossible de charger le JSON UV1 :", err);
    UV1_DATA = {};
  }
}

// 🌟 Tirage aléatoire sécurisé
function pickRandom(cat, n = 1) {
  const label = CATEGORY_MAP[cat];
  const list = UV1_DATA[label] || [];
  if (!list.length) {
    console.warn("Catégorie vide ou introuvable :", cat);
    return n === 1 ? null : [];
  }
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

// 🌟 Construction séquence UV1
function buildUV1Exam() {
  const seq = [];

  const p1 = pickRandom("3pas", 3);
  if (p1) p1.forEach((ex, i) => seq.push({
    cat: "3pas",
    fr: ex.fr,
    jp_katakana: ex.jp_katakana,
    jp_romaji: ex.jp_romaji,
    time: 45,
    announce: i === 0 ? "Première partie. Enchaînements sur trois pas." : null
  }));

  const p2 = pickRandom("surplace", 1);
  if (p2) {
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
  }

  const p3 = pickRandom("multi", 1);
  if (p3) {
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
