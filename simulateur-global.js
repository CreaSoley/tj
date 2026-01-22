/*******************************************************
 * SIMULATEUR GLOBAL – EXAMEN / ENTRAÎNEMENT
 * - Modes : officiel / adapté / personnalisé
 * - Pause entre UV
 * - Timers propres (1 seul timer global)
 * - UV2 / UV5 / UV6 pilotés par leurs modules
 *******************************************************/

/* =========================
   CONFIGURATION UV
========================= */

const UVS = {
  UV1: { name: "Kihon", fixedTime: 10 },
  UV2: { name: "Ippon Kumite" },
  UV3: { name: "Kata" },
  UV4: { name: "Épreuves techniques" },
  UV5: { name: "Assauts imposés" },
  UV6: { name: "Randori" }
};

const UV_PRESETS = {
  officiel: ["UV1","UV2","UV3","UV4","UV5","UV6"],
  adapte:   ["UV1","UV4","UV2","UV5","UV1","UV6"]
};

/* =========================
   ÉTAT GLOBAL
========================= */

let sequence = [];
let currentIndex = 0;
let timer = null;
let remaining = 0;
let paused = false;
let stopped = false;
let recap = [];

/* =========================
   OUTILS
========================= */

function speakFR(text){
  return new Promise(res=>{
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.onend = res;
    speechSynthesis.speak(u);
  });
}

function formatTime(sec){
  return String(Math.floor(sec/60)).padStart(2,"0")+":"+
         String(sec%60).padStart(2,"0");
}

function updateTimer(sec){
  const el = document.getElementById("countdown");
  if(el) el.textContent = formatTime(sec);
}

/* =========================
   CONSTRUCTION SÉQUENCE
========================= */

function getUVTime(uv){
  if (UVS[uv].fixedTime) return UVS[uv].fixedTime * 60;

  if (uv === "UV2") {
    const interval = parseInt(document.getElementById("uv2-interval").value)||5;
    return interval * 10; // 5 techniques x 2 gardes
  }

  if (uv === "UV5") {
    const c = parseInt(document.getElementById("uv5-count").value)||5;
    const i = parseInt(document.getElementById("uv5-read-interval").value)||15;
    return c * i;
  }

  if (uv === "UV6") {
    const c = parseInt(document.getElementById("uv6-count").value)||5;
    const i = parseInt(document.getElementById("uv6-read-interval").value)||15;
    return c * i;
  }

  return (parseInt(document.getElementById("uvTime-"+uv)?.value)||5)*60;
}

function buildSequence(){
  const mode = document.getElementById("examMode").value;

  if(mode === "custom"){
    const seq = [];
    for(let i=0;i<6;i++){
      const uv = document.getElementById("uvSelect"+i).value;
      seq.push({ uv, duration: getUVTime(uv) });
    }
    return seq;
  }

  return UV_PRESETS[mode].map(uv=>({
    uv,
    duration: getUVTime(uv)
  }));
}

/* =========================
   EXAMEN
========================= */

async function announceCandidate(){
  const title = document.getElementById("candidateTitle").value || "Monsieur";
  const name  = document.getElementById("candidate").value || "candidat";
  await speakFR(`${title} ${name}, avancez-vous`);
}

async function startExam(){
  stopped = false;
  paused = false;
  recap = [];
  currentIndex = 0;

  sequence = buildSequence();

  await speakFR("Début du passage de grade");
  nextUV();
}

async function nextUV(){
  if(stopped || currentIndex >= sequence.length){
    return endExam();
  }

  const pauseMin = parseInt(document.getElementById("pauseDuration").value)||0;
  if(pauseMin>0){
    document.getElementById("text").textContent = "Pause";
    await speakFR("Pause");
    await wait(pauseMin*60000);
  }

  const { uv, duration } = sequence[currentIndex];
  const name = UVS[uv].name;

  document.getElementById("text").textContent = `${uv} – ${name}`;
  recap.push(`${uv} – ${name}`);

  await announceCandidate();
  await speakFR(`Unité de valeur ${name}`);

  runUV(uv, duration);
}

/* =========================
   TIMER UNIQUE
========================= */

function startTimer(seconds, onEnd){
  clearInterval(timer);
  remaining = seconds;
  updateTimer(remaining);

  timer = setInterval(()=>{
    if(paused || stopped) return;
    remaining--;
    updateTimer(remaining);
    if(remaining<=0){
      clearInterval(timer);
      onEnd();
    }
  },1000);
}

/* =========================
   DISPATCH UV
========================= */

function runUV(uv, duration){
  if(uv==="UV1") return runUV1(duration);
  if(uv==="UV2") return runUV2();
  if(uv==="UV3") return runTimedUV("kata", duration);
  if(uv==="UV4") return runTimedUV("épreuves techniques", duration);
  if(uv==="UV5") return runUV5(duration);
  if(uv==="UV6") return runUV6(duration);
}

/* =========================
   UV
========================= */

function runUV1(duration){
  startTimer(duration, async ()=>{
    await speakFR("Fin de l’unité de valeur Kihon");
    currentIndex++; nextUV();
  });
}

async function runUV2(){
  const interval = parseInt(document.getElementById("uv2-interval").value)||5;
  await UV2.start(interval);
  await speakFR("Fin de l’unité de valeur Ippon Kumite");
  currentIndex++; nextUV();
}

function runTimedUV(label, duration){
  startTimer(duration, async ()=>{
    await speakFR(`Fin de l’unité de valeur ${label}`);
    currentIndex++; nextUV();
  });
}

function runUV5(duration){
  UV56.startUV5();
  startTimer(duration, async ()=>{
    UV56.stopUV5();
    await speakFR("Fin de l’unité de valeur assauts imposés");
    currentIndex++; nextUV();
  });
}

function runUV6(duration){
  UV56.startUV6();
  startTimer(duration, async ()=>{
    UV56.stopUV6();
    await speakFR("Fin de l’unité de valeur randori");
    currentIndex++; nextUV();
  });
}

/* =========================
   CONTRÔLES
========================= */

function togglePause(){
  paused = !paused;
}

function stopExam(){
  stopped = true;
  clearInterval(timer);
  speechSynthesis.cancel();
  UV2?.stop();
  UV56?.stopUV5();
  UV56?.stopUV6();
}

async function endExam(){
  await speakFR("Fin de l'examen. Vous pouvez regagner votre place.");
  document.getElementById("text").textContent = "Terminé";
  document.getElementById("log").innerHTML =
    "<strong>Récap :</strong><br>"+recap.join("<br>");
}
