/* ======================================================
   UV2 – IPPON KUMITE (MODULE POUR SIMULATEUR GLOBAL)
   ------------------------------------------------------
   - Page unique (simulateur global)
   - Aucune UI propre
   - Utilise uv2.json existant
   - Compatible pause / stop
   ====================================================== */

/* ===================== ÉLÉMENTS PARTAGÉS ===================== */
const uv2Text = document.getElementById("currentText");
const uv2Timer = document.getElementById("timer");

/* ===================== DONNÉES ===================== */
let UV2_DATA = [];

/* ===================== CHARGEMENT JSON ===================== */
async function loadUV2Data() {
  if (UV2_DATA.length) return;
  const res = await fetch("uv2.json");
  UV2_DATA = await res.json();
}

/* ===================== OUTILS ===================== */
const wait = ms => new Promise(r => setTimeout(r, ms));

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/* ===================== CONSTRUCTION EXAMEN ===================== */
function buildUV2Exam() {
  /*
    Structure attendue de uv2.json (exemple) :
    [
      { "role": "tori", "text": "Attaque oi zuki jodan" },
      { "role": "uke",  "text": "Défense gedan barai" }
    ]
  */

  // Ordre aléatoire mais stable
  return shuffle(UV2_DATA);
}

/* ===================== MOTEUR UV2 ===================== */
async function runUV2Sequence(sequence) {
  await speak("Ippon kumité.");
  await wait(1000);

  for (const ex of sequence) {
    if (stopped) return;

    uv2Text.textContent = ex.text;

    await speak(ex.text);

    // Temps d'exécution réaliste (jury)
    let t = 10; // secondes par attaque
    uv2Timer.textContent = format(t);

    while (t > 0) {
      if (stopped) return;
      if (!paused) {
        await wait(1000);
        t--;
        uv2Timer.textContent = format(t);
      } else {
        await wait(300);
      }
    }
  }
}

/* ===================== POINT D’ENTRÉE ===================== */
async function runUV2Exam() {
  await loadUV2Data();

  uv2Text.textContent = "UV2 – Ippon Kumite";
  await speak("Unité de valeur deux. Ippon kumité.");
  await wait(1000);

  const seq = buildUV2Exam();
  await runUV2Sequence(seq);
}

// Exposition globale
window.runUV2Exam = runUV2Exam;
