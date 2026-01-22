const IPPON = [
  { romaji: "Oi Tsuki Jodan", jp: "オイヅキ ジョウダン" },
  { romaji: "Oi Tsuki Chudan", jp: "オイヅキ チュウダン" },
  { romaji: "Mae Geri Chudan", jp: "マエゲリ チュウダン" },
  { romaji: "Mawashi Geri Chudan", jp: "マワシゲリ チュウダン" },
  { romaji: "Yoko Geri Chudan", jp: "ヨコゲリ チュウダン" }
];

function speakJP(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  speechSynthesis.speak(u);
}

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

let uv2Running = false;
let uv2Index = 0;
let uv2Interval = 5000;

async function uv2RunSequence(){
  for (let i = 0; i < IPPON.length; i++) {
    if (!uv2Running) return;
    speakJP(IPPON[i].jp);
    await wait(uv2Interval);
  }
}

window.UV2 = {
  start: function(intervalSec){
    return new Promise(async resolve => {
      uv2Running = true;
      uv2Interval = intervalSec * 1000;

      speakJP("HIDARI KAMAE");
      await uv2RunSequence();

      speakJP("MIGI KAMAE");
      await uv2RunSequence();

      resolve(); // 🔑 TRÈS IMPORTANT
    });
  },
  stop(){
    uv2Running = false;
    speechSynthesis.cancel();
  }
};
