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

  // ✅ WAIT respectant pause + stop
  async function wait(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (!running || stopped) return;
      if (!paused) {
        await new Promise(r => setTimeout(r, 100));
      } else {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }

  async function start(intervalSec, speakJP) {
    running = true;

    // Annonces FR en français (pas en japonais)
    await speak("HIDARI KAMAE");
    await wait(3000);
    await speak("Les deux candidats sont en garde. Les attaques ainsi que le niveau sont annoncés.");
    await speak("À chaque fois, les attaques et les contre-attaques devront être différentes.");
    await speak("Le test sera composé de deux séries des 5 attaques suivantes, exécutées d’abord à droite puis à gauche.");
    await wait(1000);

    // ⚠️ Intervalle (en secondes)
    const interval = Number(intervalSec) || 5;

    // Série droite
    for (let i = 0; i < IPPON.length; i++) {
      if (!running || stopped) return;
      await speakJP(IPPON[i].jp);
      await wait(interval * 1000);
    }

    if (!running || stopped) return;

    await speak("MIGI KAMAE");
    await wait(3000);

    // Série gauche
    for (let i = 0; i < IPPON.length; i++) {
      if (!running || stopped) return;
      await speakJP(IPPON[i].jp);
      await wait(interval * 1000);
    }

    if (stopCallback) stopCallback();
  }

  function stop() {
    running = false;
  }

  return { start, stop, setStopCallback: cb => stopCallback = cb };
})();
