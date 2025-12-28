/********************************************************************
 * UV1 – Kihon (VERSION AVEC DING + LATENCES + VITESSE)
 ********************************************************************/
document.addEventListener("DOMContentLoaded", async () => {

  /********************************************************************
   * OUTILS
   ********************************************************************/
  const INITIAL_DELAY_MS = 10000; // 10s après "Lire"
  const DING_TO_SPEECH_DELAY_MS = 1500; // 1.5s après ding

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function playSound(file) {
    try {
      const a = new Audio(file);
      a.play().catch(() => {});
      return a;
    } catch {
      return null;
    }
  }

  function playBeep() { playSound("beep.mp3"); }
  function playDing() { playSound("ding.mp3"); }

  // ✅ Fonction générique pour parler dans une langue donnée
  function speak(text, lang = "ja-JP", speed = 1) {
    return new Promise((resolve) => {
      if (!text) return resolve();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = speed;
      utter.onend = resolve;
      utter.onerror = resolve;
      speechSynthesis.speak(utter);
    });
  }

  function pickRandom(arr, count) {
    const copy = [...arr];
    const result = [];
    for (let i = 0; i < count && copy.length; i++) {
      const index = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(index, 1)[0]);
    }
    return result;
  }

  async function loadJSON(file) {
    try {
      const res = await fetch(file, { cache: "no-store" });
      if (!res.ok) {
        console.error(`❌ Erreur ${res.status}: impossible de charger ${file}`);
        return null;
      }
      return res.json();
    } catch (e) {
      console.error(`❌ Erreur réseau/JSON pour ${file}`, e);
      return null;
    }
  }

  /********************************************************************
   * DONNÉES EN DUR KIHON COMBAT (fallback)
   ********************************************************************/
  const KCB_FALLBACK = [
    { jp: "Oï Tsuki jodan" },
    { jp: "Gyaku Tsuki chudan" },
    { jp: "Kizami Tsuki jodan, Gyaku Tsuki Chudan" },
    { jp: "Mae Geri, ambe arrière posée derrière" },
    { jp: "Mawashi Geri, jambe arrière posée derrière" },
    { jp: "Mae Geri de la jambe avant avec sursaut" },
    { jp: "Mawashi geri de la jambe avant avec sursaut" },
  ];

  /********************************************************************
   * CHARGEMENT JSON (avec les vraies clés)
   ********************************************************************/
  const ksJson = await loadJSON("kihon_simples.json");
  const KS_DATA = ksJson ? ksJson.kihon : [];

  const kcJson = await loadJSON("kihon_enchainements_simples.json");
  const KC_DATA = kcJson ? kcJson["enchaînements"] : [];

  const kcbJson = await loadJSON("kihon_combat.json");
  let KCB_DATA = kcbJson ? (kcbJson.kihon || kcbJson.combat || []) : [];
  if (!KCB_DATA.length) KCB_DATA = KCB_FALLBACK;

  console.log("KS:", KS_DATA.length, "KC:", KC_DATA.length, "KCB:", KCB_DATA.length);

  /********************************************************************
   * MODULE GÉNÉRIQUE
   ********************************************************************/
  function initModule(config) {
    const {
      countInput, intervalInput, intervalDisplayId,
      speedInput, speedDisplayId,
      btnRandom, btnRead, btnStop,
      outBox, beepIcon,
      data,
      lang = "ja-JP"  // ✅ Langue par défaut : japonais
    } = config;

    const intervalDisplay = document.getElementById(intervalDisplayId);
    const speedDisplay = speedDisplayId ? document.getElementById(speedDisplayId) : null;

    let beepEnabled = true;
    let runId = 0;
    let running = false;

    if (intervalDisplay) intervalDisplay.textContent = `${intervalInput.value}s`;
    if (speedDisplay && speedInput) speedDisplay.textContent = `${speedInput.value}x`;

    if (!data || data.length === 0) {
      outBox.innerHTML = "<div>❌ Données manquantes.</div>";
      btnRandom.disabled = true;
      btnRead.disabled = true;
      return;
    }

    let sequence = [];

    beepIcon.addEventListener("click", () => {
      beepEnabled = !beepEnabled;
      beepIcon.classList.toggle("off", !beepEnabled);
      stopAll();
    });

    function stopAll() {
      runId++;
      running = false;
      speechSynthesis.cancel();
    }

    intervalInput.addEventListener("input", () => {
      if (intervalDisplay) intervalDisplay.textContent = `${intervalInput.value}s`;
    });

    if (speedInput && speedDisplay) {
      speedInput.addEventListener("input", () => {
        speedDisplay.textContent = `${speedInput.value}x`;
      });
    }

    btnRandom.addEventListener("click", () => {
      const count = countInput ? Math.max(1, parseInt(countInput.value || "1", 10)) : 1;
      sequence = pickRandom(data, count);
      outBox.innerHTML = sequence.map(t => `<div>${t.jp}</div>`).join("");
    });

    btnRead.addEventListener("click", async () => {
      if (running) return;

      if (!sequence.length) {
        btnRandom.click();
        if (!sequence.length) return;
      }

      running = true;
      const myRun = ++runId;

      if (beepEnabled) playBeep();

      await wait(INITIAL_DELAY_MS);
      if (myRun !== runId) return;

      const intervalMs = Math.max(0, parseInt(intervalInput.value, 10)) * 1000;
      const speed = speedInput ? parseFloat(speedInput.value) : 1;

      for (let i = 0; i < sequence.length; i++) {
        if (myRun !== runId) return;

        if (beepEnabled) playDing();

        await wait(DING_TO_SPEECH_DELAY_MS);
        if (myRun !== runId) return;

        // ✅ Utilise la langue configurée (jp ou fr)
        await speak(sequence[i].jp, lang, speed);
        if (myRun !== runId) return;

        if (i < sequence.length - 1) {
          await wait(intervalMs);
          if (myRun !== runId) return;
        }
      }

      // ✅ Attendre l'intervalle avant le beep final
      await wait(intervalMs);
      if (myRun !== runId) return;

      if (beepEnabled) playBeep();
      running = false;
    });

    btnStop.addEventListener("click", () => {
      stopAll();
    });

    btnRandom.click();
  }

  /********************************************************************
   * ACTIVATION DES 3 MODULES UV1
   ********************************************************************/
  
  // ✅ Module 1 : Kihon simples - JAPONAIS
  initModule({
    countInput: document.getElementById("ks-count"),
    intervalInput: document.getElementById("ks-interval"),
    intervalDisplayId: "ks-interval-display",
    speedInput: document.getElementById("ks-speed"),
    speedDisplayId: "ks-speed-display",
    btnRandom: document.getElementById("ks-generate"),
    btnRead: document.getElementById("ks-read"),
    btnStop: document.getElementById("ks-stop"),
    outBox: document.getElementById("ks-result"),
    beepIcon: document.getElementById("ks-beep"),
    data: KS_DATA,
    lang: "ja-JP"  // ✅ Japonais
  });

  // ✅ Module 2 : Kihon enchaînements - JAPONAIS
  initModule({
    countInput: document.getElementById("kc-count"),
    intervalInput: document.getElementById("kc-interval"),
    intervalDisplayId: "kc-interval-display",
    speedInput: document.getElementById("kc-speed"),
    speedDisplayId: "kc-speed-display",
    btnRandom: document.getElementById("kc-generate"),
    btnRead: document.getElementById("kc-read"),
    btnStop: document.getElementById("kc-stop"),
    outBox: document.getElementById("kc-result"),
    beepIcon: document.getElementById("kc-beep"),
    data: KC_DATA,
    lang: "ja-JP"  // ✅ Japonais
  });

  // ✅ Module 3 : Kihon combat - FRANÇAIS
  initModule({
    countInput: document.getElementById("kcb-count"),
    intervalInput: document.getElementById("kcb-interval"),
    intervalDisplayId: "kcb-interval-display",
    speedInput: null,
    speedDisplayId: null,
    btnRandom: document.getElementById("kcb-generate"),
    btnRead: document.getElementById("kcb-read"),
    btnStop: document.getElementById("kcb-stop"),
    outBox: document.getElementById("kcb-result"),
    beepIcon: document.getElementById("kcb-beep"),
    data: KCB_DATA,
    lang: "fr-FR"  // ✅ FRANÇAIS pour le 3ème module
  });

});
