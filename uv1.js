/* =========================
   UV1 – Kihon Blindé
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

// --------------------
// Utilitaires
// --------------------
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
    const res = await fetch("enchainements_propres.json");
    UV1_DATA = await res.json();
  } catch (err) {
    console.error("Impossible de charger le JSON UV1 :", err);
    UV1_DATA = {};
  }
}

const waitMs = ms => new Promise(r => setTimeout(r, ms));

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

async function speakJP(text) {
  if (!text) return;
  for (let i = 0; i < 2; i++) { // lire deux fois
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.7;
    await new Promise(resolve => { u.onend = resolve; speechSynthesis.speak(u); });
  }
}

async function speakFR(text) {
  if (!text) return;
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.97;
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}

function buildUV1Exam() {
  const seq = [];

  try {
    const p1 = pickRandom("3pas", 3);
    p1?.forEach((ex, i) => seq.push({
      cat: "3pas",
      fr: ex.fr || "",
      jp_katakana: ex.jp_katakana || "",
      jp_romaji: ex.jp_romaji || "",
      time: 45,
      announce: i === 0 ? "Première partie. Enchaînements sur trois pas." : null
    }));

    const p2 = pickRandom("surplace", 1);
    if (p2) {
      ["gauche","droite"].forEach(g => seq.push({
        cat: "surplace",
        fr: p2.fr || "",
        jp_katakana: p2.jp_katakana || "",
        jp_romaji: p2.jp_romaji || "",
        garde: g,
        time: 30,
        announce: g === "gauche" ? "Deuxième partie. Enchaînements sur place." : null
      }));
    }

    const p3 = pickRandom("multi", 1);
    if (p3) {
      ["gauche","droite"].forEach(g => seq.push({
        cat: "multi",
        fr: p3.fr || "",
        jp_katakana: p3.jp_katakana || "",
        jp_romaji: p3.jp_romaji || "",
        garde: g,
        time: 45,
        announce: g === "gauche" ? "Troisième partie. Multidirectionnel." : null
      }));
    }

    const p4 = pickRandom("cibles", 5);
    p4?.forEach((ex, i) => seq.push({
      cat: "cibles",
      fr: ex.fr || "",
      jp_katakana: ex.jp_katakana || "",
      jp_romaji: ex.jp_romaji || "",
      time: 30,
      announce: i === 0 ? "Quatrième partie. Travail sur cibles." : null
    }));
  } catch (err) {
    console.error("Erreur lors de la construction de la séquence UV1 :", err);
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

    if (ex.jp_katakana) await speakJP(ex.jp_katakana);

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
  console.log("Séquence UV1 construite :", seq);
  await runUV1Sequence(seq);

  resetBackground();
  await speakFR("Fin de l’unité de valeur Kihon.");
  await speakFR("Vous pouvez regagner votre place");
}

// --------------------
// Exposer globalement
// --------------------
window.runUV1Exam = runUV1Exam;
window.resetBackground = resetBackground;
window.setUV1Background = setUV1Background;
