/* =========================
   Simulateur Global UV
   ========================= */

let paused = false;
let stopped = false;
let uvIndex = 0;

let order = ["UV1","UV2","UV3","UV4","UV5","UV6"];
let timerInterval = null;
let examMode = "full"; // "full" ou "single"


function collapseConfigUI() {
  const cfg = document.getElementById("step-config");
  const exam = document.getElementById("step-exam");

  if (cfg && exam) {
    cfg.classList.add("step-collapsed");
    exam.classList.remove("step-collapsed");
  }
}

/* =========================
   UTILITAIRES
   ========================= */

function speak(text) {
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.97;
    u.onend = resolve;
    speechSynthesis.speak(u);
  });
}

function format(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateTimerDisplay(sec) {
  document.getElementById("countdown").textContent = format(sec);
}

async function runCountdown(seconds) {
  return new Promise(resolve => {
    let remaining = seconds;
    updateTimerDisplay(remaining);

    const interval = setInterval(() => {
      if (stopped) {
        clearInterval(interval);
        return resolve();
      }
      if (!paused) {
        remaining--;
        updateTimerDisplay(remaining);
      }
      if (remaining <= 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}

function stopAll() {
  stopped = true;
  paused = false;
  clearInterval(timerInterval);
  speechSynthesis.cancel();

  if (window.UV2) UV2.stop();
  if (window.UV56) {
    UV56.stopUV5();
    UV56.stopUV6();
  }

  document.getElementById("text").textContent = "Arrêté";
  document.getElementById("countdown").textContent = "00:00";
}

/* =========================
   Annonces officielles
   ========================= */

function getCandidate() {
  const name = document.getElementById("candidate")?.value || "candidat";
  const title = document.getElementById("candidateTitle")?.value || "Monsieur";
  return { name, title };
}

async function announceStart() {
  const candidate = getCandidate();
  await speak(`Passage de grade de ${candidate.title} ${candidate.name}`);
  await new Promise(r => setTimeout(r, 3000));
  await speak(`${candidate.title} ${candidate.name} avancez-vous !`);
}

/* =========================
   UV RUNNERS
   ========================= */

async function runUV1() {
  document.getElementById("text").textContent = "UV1 – Kihon";

  await speak("Unité de valeur une: Kihon");
  await speak("Veuillez exécuter les enchaînements demandés");

  await window.runUV1Exam();

  await speak("Fin de l’unité de valeur Kihon");
  await speak("Vous pouvez regagner votre place");

 if (examMode === "full") nextUV();

}

async function runUV2() {
  document.getElementById("text").textContent = "UV2 – Ippon Kumite";

  await speak("Unité de valeur deux : Ippon Kumite");
  await speak("Les deux candidats sont en garde. Les attaques ainsi que le niveau sont annoncés.");
  await speak("À chaque fois, les attaques et les contre-attaques devront être différentes.");
  await speak("Le test sera composé de deux séries des 5 attaques suivantes : Oï tsouki jodane, Oï tsouki tchoudane,Maï guéri,Maouachi guéri et Yoko guéri  exécutées d’abord à droite puis à gauche.");

 UV2.setStopCallback(async () => {
  if (stopped) return;

  document.getElementById("currentText").innerHTML = "";

  await speak("Fin de l’unité de valeur Ippon Kumite");
  await speak("Vous pouvez regagner votre place");
  if (examMode === "full") nextUV();

});


const intervalInput = document.getElementById("uv2-interval");
const interval = intervalInput ? Number(intervalInput.value) : 5;

UV2.start(interval, (data) => {
  const display = document.getElementById("currentText");

  if (typeof data === "string") {
    // sécurité si jamais
    display.textContent = data;
    return;
  }

  // 📺 Affichage Romaji + Katakana
  display.innerHTML = `
    <div style="font-size:1.6rem;font-weight:600;">
      ${data.romaji}
    </div>
    <div style="font-size:1.2rem;opacity:0.8;">
      ${data.jp}
    </div>
  `;

  // 🔊 Lecture japonaise UNIQUEMENT
  const u = new SpeechSynthesisUtterance(data.jp);
  u.lang = "ja-JP";
  u.rate = 0.95;
  speechSynthesis.speak(u);
});



   }

async function runUV3() {
  document.getElementById("text").textContent = "UV3 – Kata";

  await speak("Unité de valeur trois : Kata");
  await speak("Annoncez le kata que vous avez choisi.");
  await speak("Vous pouvez commencer.");

  await window.runUV3Exam(async () => {
    if (stopped) return;
  
    await speak("Vous pouvez regagner votre place");
  if (examMode === "full") nextUV();

  });
}

async function runUV4() {
  document.getElementById("text").textContent = "UV4 – Épreuves techniques";

  await speak("Unité de valeur quatre : Épreuves techniques");

  await window.runUV4Exam(async () => {
    if (stopped) return;
  
    await speak("Vous pouvez regagner votre place");
   if (examMode === "full") nextUV();
;
  });
}

async function runUV5() {
  document.getElementById("text").textContent = "UV5 – Assauts imposés";

  const count = Number(document.getElementById("uv5-count")?.value) || 5;
  const interval = Number(document.getElementById("uv5-interval")?.value) || 15;

  await speak("Unité de valeur cinq : Assauts imposés");
  await speak(`Vous allez exécuter ${count} enchaînement technique de défense en réponse aux attaques annoncées.`);
  await speak(`Le temps entre chaque assaut est de ${interval} secondes.`);
  await speak("Commencez.");

  UV56.startUV5(interval, count, (txt) => speak(txt));

  setTimeout(async () => {
    if (stopped) return;
    UV56.stopUV5();
    await speak("Fin de l’unité de valeur Assauts imposés");
    await speak("Vous pouvez regagner votre place");
   if (examMode === "full") nextUV();

  }, count * interval * 1000);
}

async function runUV6() {
  document.getElementById("text").textContent = "UV6 – Randori";

  const count = Number(document.getElementById("uv6-count")?.value) || 5;
  const interval = Number(document.getElementById("uv6-interval")?.value) || 15;

  await speak("Unité de valeur six : Randori");
  await speak(`Vous allez exécuter ${count} enchaînement technique de défense en réponse aux attaques annoncées`);
  await speak(`Le temps entre chaque annonce est de ${interval} secondes.`);
  await speak("Commencez.");

  UV56.startUV6(interval, count, (txt) => speak(txt));

  setTimeout(async () => {
    if (stopped) return;
    UV56.stopUV6();
    await speak("Fin de l’unité de valeur Randori");
    await speak("Vous pouvez regagner votre place");
   if (examMode === "full") nextUV();

  }, count * interval * 1000);
}

/* =========================
   SEQUENCE UV
   ========================= */

function nextUV() {
  if (stopped) return;
  if (examMode === "single") return;

  if (uvIndex >= order.length) {
    speak("Fin de l'examen. Vous pouvez regagner votre place.");
    document.getElementById("text").textContent = "Terminé";
    return;
  }

  const uv = order[uvIndex++];
  document.getElementById("uv-order-indicator").textContent = `→ ${uv}`;

  if (uv === "UV1") runUV1();
  if (uv === "UV2") runUV2();
  if (uv === "UV3") runUV3();
  if (uv === "UV4") runUV4();
  if (uv === "UV5") runUV5();
  if (uv === "UV6") runUV6();
}

function collapseConfigUI() {
  const cfg = document.getElementById("step-config");
  const exam = document.getElementById("step-exam");

  if (cfg && exam) {
    cfg.classList.add("step-collapsed");
    exam.classList.remove("step-collapsed");
  }
}

/* =========================
  ORDRE UV
   ========================= */
function buildUVOrder() {
  return Array.from(document.querySelectorAll("#uvOrderList li"))
    .map(li => li.dataset.uv);
}

document.addEventListener("click", e => {
  if (!e.target.matches(".up, .down")) return;

  const li = e.target.closest("li");
  const list = li.parentElement;

  if (e.target.classList.contains("up") && li.previousElementSibling) {
    list.insertBefore(li, li.previousElementSibling);
  }

  if (e.target.classList.contains("down") && li.nextElementSibling) {
    list.insertBefore(li.nextElementSibling, li);
  }
});
/* =========================
  API UV5 et UV6
   ========================= */
function displayAttack(text, index, total) {
  const el = document.getElementById("currentText");
  if (!el) return;

  el.innerHTML = `
    <div class="attack-title">Attaque ${index} / ${total}</div>
    <div class="attack-text">${text}</div>
  `;
}

/* =========================
   BOUTONS
   ========================= */

document.getElementById("startBtn").addEventListener("click", async () => {
  stopped = false;
  paused = false;
  uvIndex = 0;

  collapseConfigUI();

  examMode = document.getElementById("examPreset")?.value || "full-standard";
  const singleUV = document.getElementById("singleUV")?.value || "UV1";

  await announceStart();

  // 🔬 MODE UV ISOLÉ
  if (examMode === "single") {
    order = [singleUV];
    uvIndex = 0;

    if (singleUV === "UV1") return runUV1();
    if (singleUV === "UV2") return runUV2();
    if (singleUV === "UV3") return runUV3();
    if (singleUV === "UV4") return runUV4();
    if (singleUV === "UV5") return runUV5();
    if (singleUV === "UV6") return runUV6();

    return;
  }

  // 🎓 MODE EXAMEN COMPLET
  order = buildUVOrder();
  uvIndex = 0;
  nextUV();
});



document.getElementById("pauseBtn").addEventListener("click", () => {
  paused = !paused;
});

document.getElementById("stopBtn").addEventListener("click", () => {
  stopAll();
});
document.addEventListener("DOMContentLoaded", () => {
  const uv2IntervalEl = document.getElementById("uv2-interval");
  const uv2IntervalDisplay = document.getElementById("uv2-interval-display");

  if (uv2IntervalEl && uv2IntervalDisplay) {
    uv2IntervalDisplay.textContent = `${uv2IntervalEl.value} sec`;
    uv2IntervalEl.addEventListener("input", () => {
      uv2IntervalDisplay.textContent = `${uv2IntervalEl.value} sec`;
    });
  }
});
/* =========================
  RESET BOUTON
   ========================= */
document.getElementById("resetBtn").addEventListener("click", () => {
  stopAll();

  // Retour étape 1
  document.getElementById("step-config").classList.remove("step-collapsed");
  document.getElementById("step-exam").classList.add("step-collapsed");

  // Reset des champs
  document.getElementById("candidate").value = "";
  document.getElementById("candidateTitle").value = "Monsieur";
  document.getElementById("pauseDuration").value = 0;
  document.getElementById("uv2-interval").value = 5;
  document.getElementById("kataDuration").value = 5;
  document.getElementById("bunkaiDuration").value = 5;
  document.getElementById("uv4Duration").value = 5;
  document.getElementById("uv5-count").value = 5;
  document.getElementById("uv5-interval").value = 15;
  document.getElementById("uv6-count").value = 5;
  document.getElementById("uv6-interval").value = 15;
  document.getElementById("singleUV").value = "UV1";
});
