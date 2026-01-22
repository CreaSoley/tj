/* =========================================================
   UV2 – IPPON KUMITE
========================================================= */

(function(){

/* ---------- DONNÉES UV2 ---------- */
const IPPON = [
  { romaji: "Oi Tsuki Jodan", jp: "オイヅキ ジョウダン" },
  { romaji: "Oi Tsuki Chudan", jp: "オイヅキ チュウダン" },
  { romaji: "Mae Geri Chudan", jp: "マエゲリ チュウダン" },
  { romaji: "Mawashi Geri Chudan", jp: "マワシゲリ チュウダン" },
  { romaji: "Yoko Geri Chudan", jp: "ヨコゲリ チュウダン" }
];

let running = false;

/* ---------- UTILS LOCALES ---------- */
function speakJP(text){
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.onend = res;
    speechSynthesis.speak(u);
  });
}

function delay(ms){
  return new Promise(r => setTimeout(r, ms));
}

/* ---------- LOGIQUE ---------- */
async function runSide(label, interval){
  await speakJP(label);
  for (const tech of IPPON) {
    if (!running) return;
    await speakJP(tech.jp);
    await delay(interval);
  }
}

/* ---------- API PUBLIQUE ---------- */
window.UV2 = {

  start: async function(intervalSec){
    running = true;
    const interval = intervalSec * 1000;

    await runSide("HIDARI KAMAE", interval);
    if (!running) return;

    await runSide("MIGI KAMAE", interval);
  },

  stop: function(){
    running = false;
    speechSynthesis.cancel();
  },

  getDuration: function(intervalSec){
    return IPPON.length * 2 * intervalSec;
  }
};

})();
