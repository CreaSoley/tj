/* =========================
   UV1 – Kihon
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

// -------------------- Utilitaires --------------------

function normalizeCat(cat) {
  if (cat === "Sur trois pas") return "3pas";
  if (cat === "Sur place") return "surplace";
  if (cat === "Multidirectionnel") return "multi";
  if (cat === "Cibles") return "cibles";
  return cat;
}

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

async function speakJP(text, repeat = 2) {
  if (!text) return;
  const lines = text.split("\n");
  for (let i = 0; i < repeat; i++) {
    for (const line of lines) {
      await new Promise(resolve => {
        const u = new SpeechSynthesisUtterance(line);
        u.lang = "ja-JP";
        u.rate = 0.7;
        u.onend = resolve;
        speechSynthesis.speak(u);
      });
      await waitMs(400);
    }
  }
}

async function loadUV1Data() {
  if (Object.keys(UV1_DATA).length) return;
  try {
    const res = await fetch("enchainements_propres.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    UV1_DATA = await res.json();
  } catch (err) {
    console.error("Impossible de charger le JSON UV1 :", err);
    UV1_DATA = {};
  }
}

function pickRandom(cat, n = 1) {
  const label = CATEGORY_MAP[cat];
  if (!UV1_DATA[label] || !UV1_DATA[label].length) {
    console.warn("Catégorie vide ou introuvable :", cat);
    return n === 1 ? null : [];
  }
  const shuffled = [...UV1_DATA[label]].sort(() => Math.random() - 0.5);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

// -------------------- Construction de la séquence --------------------

function buildUV1Exam() {
  const seq = [];

  const p1 = pickRandom("3pas", 3) || [];
  p1.forEach((ex, i) => seq.push({
    cat: "3pas",
    fr: ex.fr || "",
    jp_katakana: ex.jp_katakana || "",
    jp_romaji: ex.jp_romaji || "",
    time: 45,
    announce: i === 0 ? "Première partie. Enchaînements sur trois pas." : null
  }));

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

  const p4 = pickRandom("cibles", 5) || [];
  p4.forEach((ex, i) => seq.push({
    cat: "cibles",
    fr: ex.fr || "",
    jp_katakana: ex.jp_katakana || "",
    jp_romaji: ex.jp_romaji || "",
    time: 30,
    announce: i === 0 ? "Quatrième partie. Travail sur cibles." : null
  }));

  console.log("Séquence UV1 construite :", seq);
  return seq;
}

// -------------------- Exécution de la séquence --------------------

async function runUV1Sequence(sequence) {
  for (const ex of sequence) {
    if (stopped) return;

    setUV1Background(ex.cat);

    if (ex.announce) await speak(ex.announce);

    // affichage Romaji + traduction
    uv1Text.innerHTML = `
      <div style="font-size:1.6rem;font-weight:600;">${ex.jp_romaji || ""}</div>
      <div style="font-size:1.2rem;margin-top:0.5rem;">${ex.fr || ""}</div>
    `;

    // lecture Katakana avec pauses
    if (ex.jp_katakana) await speakJP(ex.jp_katakana, 2);

    // lecture française une seule fois
    if (ex.fr) await speak(ex.fr);

    if (ex.garde) await speak("Garde à " + ex.garde);
    await speak("Hajimé");

    // timer
    let t = ex.time || 0;
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

// -------------------- UV1 exam --------------------

async function runUV1Exam() {
  await loadUV1Data();

  uv1Text.textContent = "UV1 – Kihon";
  await speak("Unité de valeur un. Kihon.");
  await waitMs(1000);

  const seq = buildUV1Exam();
  await runUV1Sequence(seq);

  // fin UV1
  resetBackground();
  await speak("Fin de l’unité de valeur Kihon");
}

window.runUV1Exam = runUV1Exam;
