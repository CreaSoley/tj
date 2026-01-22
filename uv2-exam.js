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
  start: async function(intervalSec){
    uv2Running = true;
    uv2Interval = intervalSec * 1000;

    await speakJP("HIDARI KAMAE");
    await wait(1000);
    await uv2RunSequence();

    if(!uv2Running) return;

    await speakJP("MIGI KAMAE");
    await wait(1000);
    await uv2RunSequence();
  },
  stop: function(){
    uv2Running = false;
    speechSynthesis.cancel();
  }
};
