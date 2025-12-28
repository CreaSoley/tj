/********************************************************************
 * UV1 – Kihon (VERSION AVEC DING + LATENCES + VITESSE)
 ********************************************************************/
document.addEventListener("DOMContentLoaded", async () => {

  /********************************************************************
   * OUTILS COMMUNS
   ********************************************************************/
  const INITIAL_DELAY_MS = 10000; // 10s après "Lire"
  const DING_TO_SPEECH_DELAY_MS = 1500; // 1.5s après ding

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function playSound(file) {
    try {
      const a = new Audio(file);
      a.play().catch(() => {});
      return a;
    } catch {
      return null;
    }
  }

  function playBeep() { playSound("beep.mp3"); }
  function playDing() { playSound("ding.mp3"); }

  function speak(text, lang = "ja-JP", speed = 1) {
    return new Promise((resolve) => {
      if (!text) return resolve();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = speed;
      utter.onend = resolve;
      utter.onerror = resolve;
      speechSynthesis.speak(utter);
    });
  }

  function pickRandom(arr, count) {
    const copy = [...arr];
    const result = [];
    for (let i = 0; i < count && copy.length; i++) {
      const index = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(index, 1)[0]);
    }
    return result;
  }

  async function loadJSON(file) {
    try {
      const res = await fetch(file, { cache: "no-store" });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  /********************************************************************
   * DONNÉES MODULE 1 & 3 (comme avant)
   ********************************************************************/
  // KS
  const ksJson = await loadJSON("kihon_simples.json");
  const KS_DATA = ksJson ? ksJson.kihon : [];

  // KC = ***PLUS UTILISÉ → remplacé par ton module 2 avancé***
  // mais on ne casse rien si JSON existe
  const kcJson = await loadJSON("kihon_maj2025.json");
  const KC_DATA = kcJson ? kcJson["enchaînements"] : [];

  // KCB EN DUR FR
  const KCB_DATA = [
    { jp: "Oï Tsuki jodan" },
    { jp: "Gyaku Tsuki chudan" },
    { jp: "Kizami Tsuki jodan, Gyaku Tsuki Chudan" },
    { jp: "Mae Geri jambe arrière posée derrière" },
    { jp: "Mawashi Geri jambe arrière posée derrière" },
    { jp: "Mae Geri jambe avant avec sursaut" },
    { jp: "Mawashi Geri jambe avant avec sursaut" }
  ];

  /********************************************************************
   * MODULE GÉNÉRIQUE (module 1 et 3)
   ********************************************************************/
  function initModule(config) {
    const {
      countInput, intervalInput, intervalDisplayId,
      speedInput, speedDisplayId,
      btnRandom, btnRead, btnStop,
      outBox, beepIcon,
      data,
      lang = "ja-JP"
    } = config;

    const intervalDisplay = document.getElementById(intervalDisplayId);
    const speedDisplay = speedDisplayId ? document.getElementById(speedDisplayId) : null;

    let beepEnabled = true;
    let runId = 0;
    let running = false;

    if (intervalDisplay) intervalDisplay.textContent = `${intervalInput.value}s`;
    if (speedDisplay && speedInput) speedDisplay.textContent = `${speedInput.value}x`;

    if (!data || data.length === 0) {
      outBox.innerHTML = "<div>❌ Données manquantes.</div>";
      btnRandom.disabled = true;
      btnRead.disabled = true;
      return;
    }

    let sequence = [];

    beepIcon.addEventListener("click", () => {
      beepEnabled = !beepEnabled;
      beepIcon.classList.toggle("off", !beepEnabled);
      runId++;
      running = false;
      speechSynthesis.cancel();
    });

    intervalInput.addEventListener("input", () => {
      if (intervalDisplay) intervalDisplay.textContent = `${intervalInput.value}s`;
    });

    if (speedInput && speedDisplay) {
      speedInput.addEventListener("input", () => {
        speedDisplay.textContent = `${speedInput.value}x`;
      });
    }

    btnRandom.addEventListener("click", () => {
      const count = countInput ? Math.max(1, parseInt(countInput.value || "1", 10)) : 1;
      sequence = pickRandom(data, count);
      outBox.innerHTML = sequence.map(t => `<div>${t.jp}</div>`).join("");
    });

    btnRead.addEventListener("click", async () => {
      if (running) return;
      if (!sequence.length) btnRandom.click();
      if (!sequence.length) return;

      running = true;
      const myRun = ++runId;

      if (beepEnabled) playBeep();

      await wait(INITIAL_DELAY_MS);
      if (myRun !== runId) return;

      const intervalMs = Math.max(0, parseInt(intervalInput.value, 10)) * 1000;
      const speed = speedInput ? parseFloat(speedInput.value) : 1;

      for (let i = 0; i < sequence.length; i++) {
        if (myRun !== runId) return;

        if (beepEnabled) playDing();
        await wait(DING_TO_SPEECH_DELAY_MS);

        if (myRun !== runId) return;

        await speak(sequence[i].jp, lang, speed);
        if (i < sequence.length - 1) await wait(intervalMs);
      }

      await wait(intervalMs);
      if (myRun !== runId) return;
      if (beepEnabled) playBeep();
      running = false;
    });

    btnStop.addEventListener("click", () => {
      runId++;
      running = false;
      speechSynthesis.cancel();
    });

    btnRandom.click();
  }

  /********************************************************************
   * MODULE 1 – KIHON SIMPLES (inchangé)
   ********************************************************************/
  initModule({
    countInput: document.getElementById("ks-count"),
    intervalInput: document.getElementById("ks-interval"),
    intervalDisplayId: "ks-interval-display",
    speedInput: document.getElementById("ks-speed"),
    speedDisplayId: "ks-speed-display",
    btnRandom: document.getElementById("ks-generate"),
    btnRead: document.getElementById("ks-read"),
    btnStop: document.getElementById("ks-stop"),
    outBox: document.getElementById("ks-result"),
    beepIcon: document.getElementById("ks-beep"),
    data: KS_DATA,
    lang: "ja-JP"
  });

  /********************************************************************
   * MODULE 3 – KIHON COMBAT (FR, données en dur)
   ********************************************************************/
  initModule({
    countInput: document.getElementById("kcb-count"),
    intervalInput: document.getElementById("kcb-interval"),
    intervalDisplayId: "kcb-interval-display",
    speedInput: null,
    speedDisplayId: null,
    btnRandom: document.getElementById("kcb-generate"),
    btnRead: document.getElementById("kcb-read"),
    btnStop: document.getElementById("kcb-stop"),
    outBox: document.getElementById("kcb-result"),
    beepIcon: document.getElementById("kcb-beep"),
    data: KCB_DATA,
    lang: "fr-FR"
  });


 /********************************************************************
 * MODULE 2 – KIHON ENCHAÎNEMENTS (VERSION NETTOYÉE GITHUB PAGES)
 ********************************************************************/

let enchainementsData = [];
let techniquesDescriptions = [];
let currentEnchainement = null;
let enchainementBeeper = null;
let enchainementTimeouts = [];
let isReadingEnchainement = false;
let enchainementSpeechRate = 0.7;

/* =========================
   CHARGEMENT DES DONNÉES
   ========================= */

async function loadEnchainementData() {
  try {
    // ✅ JSON des enchaînements
    const res = await fetch("kihon_maj2025.json", { cache: "no-store" });
    const json = await res.json();
    enchainementsData = json["enchaînements"] || [];

    // ✅ JSON descriptions techniques
    const res2 = await fetch("tjkihon.json", { cache: "no-store" });
    techniquesDescriptions = await res2.json();

    populateSpecialites();
    attachEnchainementEvents();

    console.log("✅ Module 2 chargé :", enchainementsData.length, "enchaînements");
  } catch (err) {
    console.error("❌ Erreur module 2 :", err);
  }
}

/* =========================
   UI & FILTRES
   ========================= */

function populateSpecialites() {
  const select = document.getElementById("filterSpecialite");
  if (!select) return;

  const specs = new Set();
  enchainementsData.forEach(e => {
    e.specialite?.forEach(s => specs.add(s));
  });

  specs.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    select.appendChild(opt);
  });
}

function attachEnchainementEvents() {
  document.getElementById("btnNouveauEnchainement")
    ?.addEventListener("click", nouveauEnchainement);

  document.getElementById("btnLectureJP")
    ?.addEventListener("click", lireEnchainementJaponais);

  document.getElementById("enchainementSpeedSlider")
    ?.addEventListener("input", e => {
      enchainementSpeechRate = parseFloat(e.target.value);
      document.getElementById("enchainementSpeedValue").textContent =
        `×${enchainementSpeechRate.toFixed(1)}`;
    });

  document.getElementById("beeperFreqSlider")
    ?.addEventListener("input", e => {
      document.getElementById("beeperFreqValue").textContent = `${e.target.value}s`;
    });

  document.getElementById("btnStartBeeper")
    ?.addEventListener("click", startEnchainementBeeper);

  document.getElementById("btnStopBeeper")
    ?.addEventListener("click", stopEnchainementBeeper);
}

/* =========================
   NOUVEL ENCHAÎNEMENT
   ========================= */

async function nouveauEnchainement() {
  const filter = document.getElementById("filterSpecialite")?.value;
  let pool = filter
    ? enchainementsData.filter(e => e.specialite?.includes(filter))
    : enchainementsData;

  if (!pool.length) {
    alert("Aucun enchaînement trouvé");
    return;
  }

  stopEnchainementBeeper();
  speechSynthesis.cancel();

  currentEnchainement = pool[Math.floor(Math.random() * pool.length)];

  document.getElementById("categorieAnnonce").textContent =
    currentEnchainement.specialite?.[0] || "Technique";

  document.getElementById("enchainementResult").innerHTML = `
    <div>
      <strong>${createClickableTerms(currentEnchainement.fr)}</strong><br>
      <em>${currentEnchainement.jp}</em>
    </div>
  `;
}

/* =========================
   AUDIO / LECTURE
   ========================= */

function lireEnchainementJaponais() {
  if (!currentEnchainement || isReadingEnchainement) return;

  isReadingEnchainement = true;
  stopEnchainementBeeper();

  speakJP(currentEnchainement.jp, () => {
    setTimeout(() => {
      speakJP(currentEnchainement.jp, () => {
        isReadingEnchainement = false;
        startEnchainementBeeper();
      });
    }, 5000);
  });
}

function speakJP(text, onEnd) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = enchainementSpeechRate;
  u.onend = onEnd;
  speechSynthesis.speak(u);
}

/* =========================
   BEEPER
   ========================= */

function startEnchainementBeeper() {
  stopEnchainementBeeper();
  const freq = parseInt(document.getElementById("beeperFreqSlider")?.value || 3) * 1000;
  enchainementBeeper = setInterval(() => {
    new Audio("top.mp3").play().catch(() => {});
  }, freq);
}

function stopEnchainementBeeper() {
  if (enchainementBeeper) clearInterval(enchainementBeeper);
  enchainementBeeper = null;
  enchainementTimeouts.forEach(t => clearTimeout(t));
  enchainementTimeouts = [];
}

/* =========================
   POPUP TECHNIQUES
   ========================= */

function createClickableTerms(text) {
  return text.split(/[,→]/).map(t => {
    const s = t.trim().replace(/'/g, "\\'");
    return `<span class="clickable-term" onclick="showTechniquePopup('${s}')">${t.trim()}</span>`;
  }).join(" → ");
}

window.showTechniquePopup = function (term) {
  const tech = techniquesDescriptions.find(t =>
    t.nom.toLowerCase().includes(term.toLowerCase())
  );

  alert(tech
    ? `${tech.nom}\n\n${tech.description}`
    : `Description non trouvée : ${term}`
  );
};

/* =========================
   LANCEMENT
   ========================= */

loadEnchainementData();


}); // ✅ fermeture du GROS document.addEventListener du début
