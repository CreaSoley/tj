const UVS = [
  { id: "UV1", name: "Kihon" },
  { id: "UV2", name: "Ippon Kumite" },
  { id: "UV3", name: "Kata" },
  { id: "UV4", name: "Épreuves techniques" },
  { id: "UV5", name: "Assauts imposés" },
  { id: "UV6", name: "Randori" }
];

const UV1_DURATION_MIN = 10;

let sequence = [];
let index = 0;
let remaining = 0;
let timerInterval = null;
let paused = false;
let stopped = false;
let recap = [];

function speak(text, lang = "fr-FR") {
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.onend = res;
    speechSynthesis.speak(u);
  });
}

function format(sec) {
  return String(Math.floor(sec / 60)).padStart(2, "0") + ":" +
         String(sec % 60).padStart(2, "0");
}

function updateTimerDisplay(sec){
  document.getElementById("countdown").textContent = format(sec);
}

function announceCandidate(){
  const title = document.getElementById("candidateTitle").value || "Monsieur";
  const name = document.getElementById("candidate").value || "candidat";
  return speak(`${title} ${name}, avancez-vous.`);
}

function buildCustomOrder() {
  const uvConfigDiv = document.getElementById("customOrder");
  uvConfigDiv.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.className = "controls-row";
    row.innerHTML = `
      <label>Ordre ${i+1}</label>
      <select id="uvSelect${i}">
        ${UVS.map(u => `<option value="${u.id}">${u.id} - ${u.name}</option>`).join("")}
      </select>
    `;
    uvConfigDiv.appendChild(row);
  }
}

buildCustomOrder();

function updateModeUI() {
  const mode = document.getElementById("examMode").value;
  const modeBtn = document.getElementById("modeBtn");
  const custom = document.getElementById("customOrder");

  if (mode === "officiel") {
    modeBtn.textContent = "Mode examen";
    modeBtn.classList.add("mode-exam");
    modeBtn.classList.remove("mode-adapte");
    modeBtn.classList.remove("mode-custom");
    custom.style.display = "none";
  }
  if (mode === "adapte") {
    modeBtn.textContent = "Mode entraînement";
    modeBtn.classList.add("mode-adapte");
    modeBtn.classList.remove("mode-exam");
    modeBtn.classList.remove("mode-custom");
    custom.style.display = "none";
  }
  if (mode === "custom") {
    modeBtn.textContent = "Mode personnalisé";
    modeBtn.classList.add("mode-custom");
    modeBtn.classList.remove("mode-exam");
    modeBtn.classList.remove("mode-adapte");
    custom.style.display = "block";
  }
}

document.getElementById("examMode").addEventListener("change", updateModeUI);
updateModeUI(); // initial

async function startExam() {
  stopped = false;
  paused = false;
  recap = [];
  index = 0;

  sequence = [];
  const mode = document.getElementById("examMode").value;

  if (mode === "officiel") {
    sequence = [
      { uv: "UV1", time: UV1_DURATION_MIN },
      { uv: "UV2", time: 5 },
      { uv: "UV3", time: 5 },
      { uv: "UV4", time: 5 },
      { uv: "UV5", time: 5 },
      { uv: "UV6", time: 5 }
    ];
  }

  if (mode === "adapte") {
    sequence = [
      { uv: "UV1", time: UV1_DURATION_MIN },
      { uv: "UV4", time: 5 },
      { uv: "UV2", time: 5 },
      { uv: "UV5", time: 5 },
      { uv: "UV1", time: UV1_DURATION_MIN },
      { uv: "UV6", time: 5 }
    ];
  }

  if (mode === "custom") {
    const used = new Set();
    for (let i = 0; i < 6; i++) {
      const uv = document.getElementById("uvSelect" + i).value;
      if (used.has(uv)) {
        alert("Chaque UV doit être unique.");
        return;
      }
      used.add(uv);
      const time = (uv === "UV1") ? UV1_DURATION_MIN : 5;
      sequence.push({ uv, time });
    }
  }

  document.getElementById("log").innerHTML = "";
  await speak(`Passage de grade du candidat ${document.getElementById("candidate").value || "candidat"}. Avancez-vous.`);
  nextUV();
}

async function nextUV() {
  if (stopped || index >= sequence.length) {
    endExam();
    return;
  }

  const pauseMin = parseInt(document.getElementById("pauseDuration").value) || 0;
  if (pauseMin > 0) {
    document.getElementById("currentUV").textContent = "Pause";
    await speak("Pause");
    await new Promise(r => setTimeout(r, pauseMin * 60000));
  }

  const { uv, time } = sequence[index];
  const uvName = UVS.find(u => u.id === uv).name;

  document.getElementById("text").textContent = `${uv} - ${uvName}`;
  document.getElementById("currentText").textContent = "";

  recap.push(`${uv} (${time} min)`);

  await announceCandidate();
  // Ici on ne dit plus "Unité de valeur" pour UV2
  if (uv !== "UV2") await speak(`Unité de valeur ${uvName}`);

  runUV(uv, time);
}

function startTimer(durationSec, onEnd) {
  clearInterval(timerInterval);
  remaining = durationSec;
  updateTimerDisplay(remaining);

  timerInterval = setInterval(() => {
    if (paused || stopped) return;

    remaining--;
    updateTimerDisplay(remaining);

    if (remaining <= 0) {
      clearInterval(timerInterval);
      onEnd();
    }
  }, 1000);
}

async function runUV(uv, timeMin) {
  if (uv === "UV1") return runUV1(timeMin);
  if (uv === "UV2") return runUV2();
  if (uv === "UV3") return runUV3();
  if (uv === "UV4") return runUV4();
  if (uv === "UV5") return runUV5();
  if (uv === "UV6") return runUV6();
}

/* ---------- UV1 ---------- */
async function runUV1(timeMin){
  startTimer(timeMin * 60, async () => {
    await speak("Fin de l’unité de valeur kihon");
    await speak("Vous pouvez regagner votre place");
    index++;
    nextUV();
  });
}

/* ---------- UV2 ---------- */
async function runUV2() {
  const intervalSec = parseInt(document.getElementById("uv2-interval").value) || 5;

  await speak("Unité de valeur : Ippon kumite");
  await speak("Les deux candidats sont en garde. Les attaques ainsi que le niveau sont annoncés.");
  await speak("A chaque fois, les attaques et les contre-attaques devront être différentes. Le test sera composé de deux séries des 5 attaques suivantes, exécutées d’abord à droite puis à gauche");

  await new Promise(r => setTimeout(r, 3000)); // latence 3 secondes

  await UV2.start(intervalSec);

  await speak("Fin de l’unité de valeur Ippon Kumite");
  await speak("Vous pouvez regagner votre place");

  index++;
  nextUV();
}


/* ---------- UV3 ---------- */
async function runUV3() {
  const kataMin = parseInt(document.getElementById("uv3-kata").value) || 5;
  const bunkaiMin = parseInt(document.getElementById("uv3-bunkai").value) || 5;

  await speak("Annoncez le kata que vous avez choisi");
  startTimer(kataMin * 60, async () => {
    await speak("Présentez les bunkaïs choisis et les séquences du kata de référence");
    startTimer(bunkaiMin * 60, async () => {
      await speak("Fin de l’unité de valeur kata");
      await speak("Vous pouvez regagner votre place");
      index++;
      nextUV();
    });
  });
}

/* ---------- UV4 ---------- */
async function runUV4() {
  await speak("Unité de valeur : épreuves techniques");
  await speak("Exécutez 3 applications sur saisie à droite ou à gauche");
  await speak("Annoncez la technique de base choisie");

  const timeMin = 5;
  startTimer(timeMin * 60, async () => {
    await speak("Fin de l’unité de valeur épreuves techniques");
    await speak("Vous pouvez regagner votre place");
    index++;
    nextUV();
  });
}

/* ---------- UV5 ---------- */
async function runUV5() {
  const count = parseInt(document.getElementById("uv5-count").value) || 5;
  const intervalSec = parseInt(document.getElementById("uv5-read-interval").value) || 15;
  const duration = count * intervalSec;

  startTimer(duration, async () => {
    await speak("Fin de l’unité de valeur assauts imposés");
    await speak("Vous pouvez regagner votre place");
    UV56.stopUV5();
    index++;
    nextUV();
  });

  UV56.startUV5(intervalSec, count);
}

/* ---------- UV6 ---------- */
async function runUV6() {
  const count = parseInt(document.getElementById("uv6-count").value) || 5;
  const intervalSec = parseInt(document.getElementById("uv6-read-interval").value) || 15;
  const duration = count * intervalSec;

  startTimer(duration, async () => {
    await speak("Fin de l’unité de valeur randori");
    await speak("Vous pouvez regagner votre place");
    UV56.stopUV6();
    index++;
    nextUV();
  });

  UV56.startUV6(intervalSec, count);
}

function togglePause() {
  paused = !paused;
}

function stopExam() {
  stopped = true;
  clearInterval(timerInterval);
  speechSynthesis.cancel();
  UV2.stop();
  UV56.stopUV5();
  UV56.stopUV6();
  document.getElementById("text").textContent = "Arrêté";
  document.getElementById("countdown").textContent = "00:00";
}

async function endExam() {
  await speak("Fin de l'examen. Vous pouvez regagner votre place.");
  document.getElementById("text").textContent = "Terminé";
  document.getElementById("currentText").textContent = "";

  const log = document.getElementById("log");
  log.innerHTML = "<strong>Récap :</strong><br>" + recap.join("<br>");
}
