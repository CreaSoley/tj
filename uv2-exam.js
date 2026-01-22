/* =========================================================
   UV2 – IPPON KUMITE
========================================================= */
const IPPON = [
  { romaji: "Oi Tsuki Jodan", jp: "オイヅキ ジョウダン" },
  { romaji: "Oi Tsuki Chudan", jp: "オイヅキ チュウダン" },
  { romaji: "Mae Geri Chudan", jp: "マエゲリ チュウダン" },
  { romaji: "Mawashi Geri Chudan", jp: "マワシゲリ チュウダン" },
  { romaji: "Yoko Geri Chudan", jp: "ヨコゲリ チュウダン" }
];

function uv2_wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function speakJP(text) {
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.onend = res;
    speechSynthesis.speak(u);
  });
}

let uv2Running = false;

async function uv2RunSequence() {
  for (let i = 0; i < 5; i++) {
    if (!uv2Running) return;
    await speakJP(IPPON[i].jp);
    await uv2_wait(window.uv2Interval * 1000);
  }
}

window.UV2 = {
  uv2Interval: 5,

  start: async function (intervalSec) {
    uv2Running = true;
    window.uv2Interval = intervalSec;

    // annonces demandées
    await speakJP("HIDARI KAMAE");
    await uv2_wait(3000); // 3 secondes de latence
    await uv2RunSequence();

    if (!uv2Running) return;

    await speakJP("MIGI KAMAE");
    await uv2_wait(3000);
    await uv2RunSequence();
  },

  stop: function () {
    uv2Running = false;
    speechSynthesis.cancel();
  }
};


