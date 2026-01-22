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
let examMode = "exam"; // "exam" | "training"

const UV_PRESETS = {
  standard: ["UV1","UV2","UV3","UV4","UV5","UV6"],
  adapte:   ["UV1","UV4","UV2","UV5","UV3","UV6"]
};

let uvOrder = [...UV_PRESETS.standard];

function speak(text) {
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
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

async function announceCandidate(){
  const title = document.getElementById("candidateTitle").value || "Monsieur";
  const name = document.getElementById("candidate").value || "candidat";
  await speak(`${title} ${name}, avancez-vous.`);
}
document.getElementById("modeBtn").onclick = () => {
  examMode = examMode === "exam" ? "training" : "exam";
  document.getElementById("modeBtn").textContent =
    examMode === "exam" ? "Mode : Examen" : "Mode : Entraînement";
};
document.getElementById("presetSelect").onchange = (e) => {
  uvOrder = [...UV_PRESETS[e.target.value]];
  buildUVConfig();
};

buildUVConfig();

function buildUVConfig(){
  const uvConfigDiv = document.getElementById("uvConfig");
  uvConfigDiv.innerHTML = "";

  uvOrder.forEach((uv, i) => {
    const uvObj = UVS.find(u => u.id === uv);

    const row = document.createElement("div");
    row.className = "controls-row";

    // Durée seulement si UV modifiable
    let timeInput = "";
    if (!["UV1","UV2","UV5","UV6"].includes(uv)) {
      timeInput = `<input type="number" id="uvTime${i}" min="1" max="15" value="5" class="input-small"> min`;
    }

    row.innerHTML = `
      <strong>${i+1}. ${uvObj.id} – ${uvObj.name}</strong>
      ${timeInput}
    `;
    uvConfigDiv.appendChild(row);
  });
}


buildUVConfig();

async function startExam() {
  stopped = false;
  paused = false;
  recap = [];
  index = 0;

 sequence = uvOrder.map((uv, i) => {
  let time = UV1_DURATION_MIN;

  if (uv === "UV3" || uv === "UV4") {
    time = parseInt(document.getElementById("uvTime" + i).value);
  }

  return { uv, time };
});

    used.add(uv);

    const time = (uv === "UV1") ? UV1_DURATION_MIN : parseInt(document.getElementById("uvTime" + i).value);
    sequence.push({ uv, time });
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
  await speak(`Unité de valeur ${uvName}`);

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
  if (uv === "UV1") return runUV1();
  if (uv === "UV2") return runUV2();
  if (uv === "UV3") return runUV3(timeMin);
  if (uv === "UV4") return runUV4(timeMin);
  if (uv === "UV5") return runUV5();
  if (uv === "UV6") return runUV6();
}

/* ---------- UV1 ---------- */
async function runUV1(){
  startTimer(UV1_DURATION_MIN * 60, async () => {
    await speak("Fin de l’unité de valeur kihon");
    await speak("Vous pouvez regagner votre place");
    index++;
    nextUV();
  });
}

/* ---------- UV2 ---------- */
async function runUV2() {
  const intervalSec = parseInt(document.getElementById("uv2-interval").value) || 5;

  await UV2.start(intervalSec);

  // FIN UV2
  await speak("Fin de l’unité de valeur Ippon Kumite");
  await speak("Vous pouvez regagner votre place");

  index++;
  nextUV();
}

/* ---------- UV3 ---------- */
async function runUV3(timeMin) {
  startTimer(timeMin * 60, async () => {
    await speak("Fin de l’unité de valeur kata");
    await speak("Vous pouvez regagner votre place");
    index++;
    nextUV();
  });
}

/* ---------- UV4 ---------- */
async function runUV4(timeMin) {
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
