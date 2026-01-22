/* ======================================================
   UV4 – ÉPREUVES TECHNIQUES (MODULE EXAMEN)
   ------------------------------------------------------
   - Pas de timer interne
   - Utilise speak() et runCountdown() du simulateur global
   - Fin signalée via callback
   ====================================================== */
function getMinutes(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const v = Number(el.value);
  return isNaN(v) || v <= 0 ? fallback : v;
}

async function runUV4Exam(onFinish) {
  const durationMin = getMinutes("uv4Duration", 5);
  const durationSec = durationMin * 60;

  const display = document.getElementById("currentText");
  display.textContent = "UV4 – Épreuves techniques";

  await speak("Unité de valeur quatre. Épreuves techniques.");
  await speak("Exécutez trois applications sur saisie à droite ou à gauche.");
  await speak("Annoncez la technique de base choisie.");
  await speak("Vous pouvez commencer.");

  await runCountdown(durationSec);

  if (typeof stopped !== "undefined" && stopped) return;

  await speak("Fin de l’unité de valeur épreuves techniques.");

  if (typeof onFinish === "function") onFinish();
}

window.runUV4Exam = runUV4Exam;
