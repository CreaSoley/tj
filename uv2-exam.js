const UV2 = (() => {

  const IPPON = [
    { romaji: "Oi Tsuki Jodan", jp: "オイヅキ ジョウダン" },
    { romaji: "Oi Tsuki Chudan", jp: "オイヅキ チュウダン" },
    { romaji: "Mae Geri Chudan", jp: "マエゲリ チュウダン" },
    { romaji: "Mawashi Geri Chudan", jp: "マワシゲリ チュウダン" },
    { romaji: "Yoko Geri Chudan", jp: "ヨコゲリ チュウダン" }
  ];

  let running = false;
  let stopCallback = null;

  async function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

  async function start(intervalSec, speakJP){
    running = true;

    await speakJP("HIDARI KAMAE");
    await wait(3000); // 3s de latence
    await speakJP("Les deux candidats sont en garde. Les attaques ainsi que le niveau sont annoncés.");
    await speakJP("A chaque fois, les attaques et les contre-attaques devront être différentes. Le test sera composé de deux séries des 5 attaques suivantes, exécutées d’abord à droite puis à gauche.");
    await wait(1000);

    for (let i = 0; i < IPPON.length; i++) {
      if (!running) return;
      await speakJP(IPPON[i].jp);
      await wait(intervalSec * 1000);
    }

    if (!running) return;

    await speakJP("MIGI KAMAE");
    await wait(3000);

    for (let i = 0; i < IPPON.length; i++) {
      if (!running) return;
      await speakJP(IPPON[i].jp);
      await wait(intervalSec * 1000);
    }

    if (stopCallback) stopCallback();
  }

  function stop(){
    running = false;
  }

  return { start, stop, setStopCallback: cb => stopCallback = cb };
})();
