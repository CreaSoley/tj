const UV2 = (() => {

  /* =========================
     DONNÉES
     ========================= */

  const IPPON = [
    { jp: "オイヅキ ジョウダン" },
    { jp: "オイヅキ チュウダン" },
    { jp: "マエゲリ チュウダン" },
    { jp: "マワシゲリ チュウダン" },
    { jp: "ヨコゲリ チュウダン" }
  ];

  let running = false;
  let stopCallback = null;

  /* =========================
     OUTILS INTERNES
     ========================= */

  function speakJP(text, speaker) {
    return speaker(text);
  }

  async function wait(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (!running) return;
      await new Promise(r => setTimeout(r, 100));
    }
  }

  /* =========================
     LOGIQUE PRINCIPALE
     ========================= */

  async function start(intervalSec = 5, speaker) {
    if (typeof speaker !== "function") {
      console.error("UV2.start : speaker manquant");
      return;
    }

    running = true;
    const interval = Number(intervalSec) || 5;

    // 🔵 KAMAE GAUCHE
    await speakJP("ヒダリ カマエ", speaker);
    await wait(3000);

    // 🔵 SÉRIE 1
    for (const atk of IPPON) {
      if (!running) return;
      await speakJP(atk.jp, speaker);
      await wait(interval * 1000);
    }

    // 🔵 KAMAE DROIT
    await speakJP("ミギ カマエ", speaker);
    await wait(3000);

    // 🔵 SÉRIE 2
    for (const atk of IPPON) {
      if (!running) return;
      await speakJP(atk.jp, speaker);
      await wait(interval * 1000);
    }

    running = false;

    if (typeof stopCallback === "function") {
      stopCallback();
    }
  }

  function stop() {
    running = false;
  }

  function setStopCallback(cb) {
    stopCallback = cb;
  }

  return {
    start,
    stop,
    setStopCallback
  };
})();
