const UV2 = (() => {

 const IPPON = [
  { romaji: "Oi tsuki jodan", jp: "オイヅキ ジョウダン" },
  { romaji: "Oi tsuki chudan", jp: "オイヅキ チュウダン" },
  { romaji: "Mae geri chudan", jp: "マエゲリ チュウダン" },
  { romaji: "Mawashi geri chudan", jp: "マワシゲリ チュウダン" },
  { romaji: "Yoko geri chudan", jp: "ヨコゲリ チュウダン" }
];

  let running = false;
  let stopCallback = null;
  let announce = null;

  async function wait(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (!running || window.stopped) return;
      await new Promise(r => setTimeout(r, 100));
    }
  }

  async function start(intervalSec = 5, announceFn) {
    running = true;
    announce = announceFn;

    // Garde gauche
    announce("ヒダリ カマエ");
    await wait(3000);

    for (const atk of IPPON) {
      if (!running || window.stopped) return;
      announce(atk.label);
      await wait(intervalSec * 1000);
    }

    // Garde droite
    announce("ミギ カマエ");
    await wait(3000);

    for (const atk of IPPON) {
      if (!running || window.stopped) return;
      announce(atk.label);
      await wait(intervalSec * 1000);
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
