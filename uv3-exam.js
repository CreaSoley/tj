/* ======================================================
   UV3 – KATA + BUNKAI (MODULE EXAMEN)
   ------------------------------------------------------
   - Pas de timer interne
   - Utilise speak() et runCountdown() du simulateur global
   - Signale la fin via callback
   ====================================================== */

function getMinutes(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const v = Number(el.value);
  return isNaN(v) || v <= 0 ? fallback : v;
}

async function runUV3Exam(onFinish) {
  const kataMin = getMinutes("kataDuration", 5);
  const bunkaiMin = getMinutes("bunkaiDuration", 5);

  const kataSec = kataMin * 60;
  const bunkaiSec = bunkaiMin * 60;

  const display = document.getElementById("currentText");
  display.textContent = "UV3 – Kata";

  await speak("Unité de valeur trois. Kata.");
  await speak("Annoncez le kata que vous avez choisi.");
  await speak("Vous pouvez commencer.");

  await runCountdown(kataSec);

  if (typeof stopped !== "undefined" && stopped) return;

  await speak("Temps écoulé.");
  await speak("Présentez les bunkaïs choisis et les séquences du kata de référence.");

  display.textContent = "UV3 – Bunkai";

  await runCountdown(bunkaiSec);

  if (typeof stopped !== "undefined" && stopped) return;

  await speak("Fin de l’unité de valeur kata.");

  if (typeof onFinish === "function") onFinish();
}

window.runUV3Exam = runUV3Exam;
