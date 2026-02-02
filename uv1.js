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

  Object.values(BG_MAP).forEach(bg => zone.classList.remove(bg));
  const bgClass = BG_MAP[cat];
  if (bgClass) zone.classList.add(bgClass);
}

function resetBackground() {
  const zone = document.getElementById("currentText");
  if (!zone) return;
  Object.values(BG_MAP).forEach(bg => zone.classList.remove(bg));
}

async function loadUV1Data() {
  if (Object.keys(UV1_DATA).length) return;
  try {
    const res = await fetch("enchainements_propre.json");
    UV1_DATA = await res.json();
  } catch (err) {
    console.error("Impossible de charger le JSON UV1 :", err);
    UV1_DATA = {}; // fallback vide
  }
}

const waitMs = ms => new Promise(r => setTimeout(r, ms));

function pickRandom(cat, n = 1) {
  const label = CATEGORY_MAP[cat];
  const list = UV1_DATA[label] || [];
  if (!list.length) return n === 1 ? null : [];
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

// Lecture Katakana deux fois à vitesse réduite
async function speakJP(text) {
  if (!text) return;
  for (let i = 0; i < 2; i++) {
    await new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.rate = 0.7;
      u.onend = resolve;
      speechSynthesis.speak(u);
    });
    await waitMs(150); // petit délai entre les deux annonces
  }
}

// Lecture française
async function speakFR(text) {
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR";
  u.rate = 0.95;
  return new Promise(resolve => {
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}

function buildUV1Exam() {
  const seq = [];

  const safeList = (cat) => UV1_DATA[CATEGORY_MAP[cat]] || [];

  // 3 pas
  const p1 = pickRandom("3pas", 3);
  if (p1) p1.forEach((ex, i) => seq.push({
    cat: "3pas",
    fr: ex.fr || "",
    jp_katakana: ex.jp_katakana || "",
    jp_romaji: ex.jp_romaji || "",
    time: 45,
    announce: i === 0 ? "Première partie. Enchaînements sur trois pas." : null
  }));

  // Sur place
  const p2 = pickRandom("surplace", 1);
  if (p2) {
    seq.push({
      cat: "surplace",
      fr: p2.fr || "",
      jp_katakana: p2.jp_katakana || "",
      jp_romaji: p2.jp_romaji || "",
      garde: "gauche",
      time: 30,
      announce: "Deuxième partie. Enchaînements sur place."
    });
    seq.push({
      cat: "surplace",
      fr: p2.fr || "",
      jp_katakana: p2.jp_katakana || "",
      jp_romaji: p2.jp_romaji || "",
      garde: "droite",
      time: 30
    });
  }

  // Multidirectionnel
  const p3 = pickRandom("multi", 1);
  if (p3) {
    seq.push({
      cat: "multi",
      fr: p3.fr || "",
      jp_katakana: p3.jp_katakana || "",
      jp_romaji: p3.jp_romaji || "",
      garde: "gauche",
      time: 45,
      announce: "Troisième partie. Multidirectionnel."
    });
    seq.push({
      cat: "multi",
      fr: p3.fr || "",
      jp_katakana: p3.jp_katakana || "",
      jp_romaji: p3.jp_romaji || "",
      garde: "droite",
      time: 45
    });
  }

  // Cibles
  const p4 = pickRandom("cibles", 5);
  if (p4 && p4.length) {
    p4.forEach((ex, i) => seq.push({
      cat: "cibles",
      fr: ex.fr || "",
      jp_katakana: ex.jp_katakana || "",
      jp_romaji: ex.jp_romaji || "",
      time: 30,
      announce: i === 0 ? "Quatrième partie. Travail sur cibles." : null
    }));
  }

  return seq;
}

async function runUV1Sequence(sequence) {
  for (const ex of sequence) {
    if (stopped) return;

    setUV1Background(ex.cat);

    if (ex.announce) await speakFR(ex.announce);

    // Affichage Romaji + traduction
    uv1Text.innerHTML = `
      <div style="font-size:1.6rem;font-weight:600;">${ex.jp_romaji || ""}</div>
      <div style="font-size:1.2rem;opacity:0.8;">${ex.fr || ""}</div>
    `;

    // Lecture Katakana deux fois
    if (ex.jp_katakana) await speakJP(ex.jp_katakana);

    // Lecture traduction
    await speakFR(ex.fr);
    await speakFR(ex.fr);

    if (ex.garde) await speakFR("Garde à " + ex.garde);

    await speakFR("Hajimé");

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
  await speakFR("Unité de valeur un. Kihon.");
  await waitMs(1000);

  const seq = buildUV1Exam();
  if (!seq.length) {
    uv1Text.textContent = "⚠️ Aucune donnée UV1 trouvée";
    await speakFR("Aucune donnée UV1 trouvée"
