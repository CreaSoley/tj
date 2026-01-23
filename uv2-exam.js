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

  // ✅ WAIT sécurisé (pause + stop sans crash)
 async function wait(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (!running) return;
    await new Promise(r => setTimeout(r, 100));
  }
}

  }

  async function start(intervalSec = 5) {
    running = true;

    // Kamae droite
    await speakJP("ヒダリ カマエ");
    await wait(3000);

    const interval = Number(intervalSec) || 5;

    // Série 1
    for (let i = 0; i < IPPON.length; i++) {
      if (!running || (typeof stopped !== "undefined" && stopped)) return;
      await speakJP(IPPON[i].jp);
      await wait(interval * 1000);
    }

    await speakJP("ミギ カマエ");
    await wait(3000);

    // Série 2
    for (let i = 0; i < IPPON.length; i++) {
      if (!running || (typeof stopped !== "undefined" && stopped)) return;
      await speakJP(IPPON[i].jp);
      await wait(interval * 1000);
    }

    if (typeof stopCallback === "function") stopCallback();
  }

  function stop() {
    running = false;
  }

  return {
    start,
    stop,
    setStopCallback: cb => stopCallback = cb
  };
})();
