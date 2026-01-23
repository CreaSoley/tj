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

  async function wait(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (!running) return;
      await new Promise(r => setTimeout(r, 100));
    }
  }

  function updateText(text) {
    const el = document.getElementById("text");
    if (el) el.textContent = text;
  }

  async function speakJP(text) {
    return new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.rate = 0.95;
      u.onend = resolve;
      speechSynthesis.speak(u);
    });
  }

  async function start(intervalSec = 5) {
    running = true;

    updateText("UV2 – Ippon Kumite");

    // Kamae gauche
    updateText("UV2 – Ippon Kumite\n→ HIDARI KAMAE");
    await speakJP("ヒダリ カマエ");
    await wait(3000);

    const interval = Number(intervalSec) || 5;

    // Série 1
    for (let i = 0; i < IPPON.length; i++) {
      if (!running || (typeof stopped !== "undefined" && stopped)) return;

      updateText(`UV2 – Ippon Kumite\n→ ${IPPON[i].romaji}`);
      await speakJP(IPPON[i].jp);
      await wait(interval * 1000);
    }

    // Kamae droite
    updateText("UV2 – Ippon Kumite\n→ MIGI KAMAE");
    await speakJP("ミギ カマエ");
    await wait(3000);

    // Série 2
    for (let i = 0; i < IPPON.length; i++) {
      if (!running || (typeof stopped !== "undefined" && stopped)) return;

      updateText(`UV2 – Ippon Kumite\n→ ${IPPON[i].romaji}`);
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
