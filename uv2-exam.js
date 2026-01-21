/********************************************************************
 * UV2 – Ippon Kumite (MODULE POUR SIMULATEUR GLOBAL)
 ********************************************************************/

/* ===================== ÉLÉMENTS PARTAGÉS ===================== */
const uv2Text = document.getElementById("currentText");
const uv2Timer = document.getElementById("timer");

/* ===================== DONNÉES ===================== */
const IPPON = [
  { romaji: "Oi Tsuki Jodan", jp: "オイヅキ ジョウダン" },
  { romaji: "Oi Tsuki Chudan", jp: "オイヅキ チュウダン" },
  { romaji: "Mae Geri Chudan", jp: "マエゲリ チュウダン" },
  { romaji: "Mawashi Geri Chudan", jp: "マワシゲリ チュウダン" },
  { romaji: "Yoko Geri Chudan", jp: "ヨコゲリ チュウダン" },

  { romaji: "Oi Tsuki Jodan", jp: "オイヅキ ジョウダン" },
  { romaji: "Oi Tsuki Chudan", jp: "オイヅキ チュウダン" },
  { romaji: "Mae Geri Chudan", jp: "マエゲリ チュウダン" },
  { romaji: "Mawashi Geri Chudan", jp: "マワシゲリ チュウダン" },
  { romaji: "Yoko Geri Chudan", jp: "ヨコゲリ チュウダン" }
];

/* ===================== VARIABLES ===================== */
let sequence = [...IPPON];
let beepEnabled = true;

/* ===================== OUTILS ===================== */
const wait = ms => new Promise(r => setTimeout(r, ms));

function playBeep() {
  new Audio("beep.mp3").play().catch(e => console.log("Beep failed, maybe no file?"));
}

function speakJP(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  speechSynthesis.speak(u);
}

function shuffle(arr) {
  return [...arr].sort(() => 0.5 - Math.random());
}

/* ===================== CONSTRUCTION EXAMEN ===================== */
function buildUV2Exam() {
  // On garde le même comportement que ton bouton "generate"
  // (ordre aléatoire)
  sequence = shuffle(IPPON);
  return sequence;
}

/* ===================== MOTEUR UV2 ===================== */
async function runUV2Sequence(intervalSeconds = 5) {
  if (beepEnabled) playBeep();

  const seq = buildUV2Exam();

  for (let i = 0; i < seq.length; i++) {
    if (stopped) return;

    uv2Text.textContent = seq[i].jp;
    speakJP(seq[i].jp);

    // Timer interne par attaque
    let t = intervalSeconds;
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

  if (beepEnabled) playBeep();
}

/* ===================== POINT D’ENTRÉE ===================== */
async function runUV2Exam() {
  uv2Text.textContent = "UV2 – Ippon Kumite";
  await speak("Unité de valeur deux. Ippon kumité.");
  await wait(800);

  // 5s par attaque par défaut (comme ton slider)
  await runUV2Sequence(5);
}

/* Exposition globale */
window.runUV2Exam = runUV2Exam;
