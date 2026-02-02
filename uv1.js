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
      fr: p3.fr,
      jp_katakana: p3.jp_katakana,
      jp_romaji: p3.jp_romaji,
      garde: "droite",
      time: 45
    });
  }

  const p4 = pickRandom("cibles", 5);
  if (p4) p4.forEach((ex, i) => seq.push({
    cat: "cibles",
    fr: ex.fr,
    jp_katakana: ex.jp_katakana,
    jp_romaji: ex.jp_romaji,
    time: 30,
    announce: i === 0 ? "Quatrième partie. Travail sur cibles." : null
  }));

  return seq;
}

// 🌟 Exécution séquence
async function runUV1Sequence(sequence) {
  for (const ex of sequence) {
    if (stopped) return;

    setUV1Background(ex.cat);

    if (ex.announce) await speakFR(ex.announce);

    // Affichage Romaji + Français
    uv1Text.textContent = ex.jp_romaji || "";
    translationText.textContent = ex.fr || "";

    // Katakana 2 fois
    if (ex.jp_katakana) await speakJP(ex.jp_katakana, 0.7, 2);

    // Français 1 seule fois
    if (ex.fr) await speakFR(ex.fr);

    if (ex.garde) await speakFR("Garde à " + ex.garde);

    await speakFR("Hajimé");

    // Timer
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

// 🌟 Lancement UV1
async function runUV1Exam() {
  await loadUV1Data();

  uv1Text.textContent = "UV1 – Kihon";
  translationText.textContent = "";
  await speakFR("Unité de valeur un. Kihon.");
  await waitMs(1000);

  const seq = buildUV1Exam();
  console.log("Séquence UV1 construite :", seq);
  await runUV1Sequence(seq);

  // Fin UV1
  resetBackground();
  uv1Text.textContent = "Fin UV1";
  translationText.textContent = "";
  await speakFR("Fin de l’unité de valeur Kihon.");
}

window.runUV1Exam = runUV1Exam;
