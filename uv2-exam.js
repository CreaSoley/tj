/* ======================================================
   UV2 – IPPON KUMITE (MODULE POUR SIMULATEUR GLOBAL)
   ------------------------------------------------------
   - Pas de JSON
   - Utilise le tableau existant dans ton JS
   - Appelé depuis runUV("UV2")
   ====================================================== */

/* ===================== ÉLÉMENTS PARTAGÉS ===================== */
const uv2Text = document.getElementById("currentText");
const uv2Timer = document.getElementById("timer");

/* ===================== DONNÉES ===================== */
/* Remplace ce tableau par ton tableau existant UV2 */
const UV2_EX = [
  "Oi zuki jodan",
  "Gyaku zuki chudan",
  "Mae geri",
  "Kizami zuki",
  "Ushiro geri",
  "Age uke / Gyaku zuki",
  "Gedan barai / Oi zuki"
];

/* ===================== OUTILS ===================== */
const wait = ms => new Promise(r => setTimeout(r, ms));

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/* ===================== CONSTRUCTION EXAMEN ===================== */
function buildUV2Exam() {
  // Ici tu peux choisir :
  // - ordre fixe : return UV2_EX;
  // - ordre aléatoire : return shuffle(UV2_EX);
  return shuffle(UV2_EX);
}

/* ===================== MOTEUR UV2 ===================== */
async function runUV2Sequence(sequence) {
  await speak("Ippon kumité.");
  await wait(800);

  for (const tech of sequence) {
    if (stopped) return;

    uv2Text.textContent = tech;
    await speak(tech);

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
  uv2Text.textContent = "UV2 – Ippon Kumite";
  await speak("Unité de valeur deux. Ippon kumité.");
  await wait(800);

  const seq = buildUV2Exam();
  await runUV2Sequence(seq);
}

/* Exposition globale */
window.runUV2Exam = runUV2Exam;
