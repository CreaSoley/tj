document.addEventListener("DOMContentLoaded", () => {

  let data = [];
  let currentRoutine = null;
  let currentIndex = 0;
  let startTime = null;
  let pausedAt = 0;
  let isPaused = false;
  let isPlaying = false;
  let pauseInterval = null;
  let pauseRemaining = 0;
  let lastInstruction = "";
  let timer = null;

  const WORDS_PER_MINUTE = 120; // très calme

  // ===== DOM =====
  const select = document.getElementById("selectRoutine");
  const presentation = document.getElementById("presentation");
  const currentLine = document.getElementById("currentLine");
  const timeLeft = document.getElementById("countdown");
  const progressFill = document.getElementById("progressFill");

  const btnStart = document.getElementById("startBtn");
  const btnPause = document.getElementById("pauseBtn");
  const btnStop  = document.getElementById("stopBtn");

  btnStart.disabled = false;
  btnPause.disabled = true;
  btnStop.disabled  = true;

  currentLine.textContent = "Prêt pour la routine…";

  // =====================
  // Chargement JSON
  // =====================
  fetch("routines.json")
    .then(res => res.json())
    .then(json => {
      data = json.routines || json;
      populateSelect();
      loadRoutine(data[0]);
    })
    .catch(err => console.error("Erreur routines.json", err));

  function populateSelect() {
    select.innerHTML = "";
    data.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = `${r.id} – ${r.nom}`;
      select.appendChild(opt);
    });
  }

  select.addEventListener("change", () => {
    const r = data.find(x => x.id === select.value);
    if (r) loadRoutine(r);
  });

  // =====================
  // Chargement routine
  // =====================
  function loadRoutine(routine) {
    currentRoutine = routine;
    currentIndex = 0;
    isPaused = false;
    isPlaying = false;
    pausedAt = 0;
    pauseRemaining = 0;

    presentation.textContent = routine.presentation;
    currentLine.textContent = "Prêt pour la routine…";

    currentRoutine.duree_totale_sec = calculateDuration(routine.script);
    timeLeft.textContent = formatTime(currentRoutine.duree_totale_sec);
    progressFill.style.width = "0%";

    btnStart.disabled = false;
    btnPause.disabled = true;
    btnStop.disabled  = true;
  }

  // =====================
  // Calcul durée
  // =====================
  function calculateDuration(script) {
    let pauses = 0;
    let words = 0;

    script.forEach(item => {
      if (item.pause) pauses += item.pause;
      if (item.text) words += item.text.split(" ").length;
    });

    const speech = (words / WORDS_PER_MINUTE) * 60;
    return Math.round(pauses + speech);
  }

  // =====================
  // Lecture vocale
  // =====================
  function speakItem(item) {
    return new Promise(resolve => {

      // ----- PAUSE -----
  if (item.haptic === "respiration" && navigator.vibrate) {
  navigator.vibrate([300, 3000, 200, 5000]);
}

if (item.pause) {
        let remaining = pauseRemaining || item.pause;
        currentLine.textContent = lastInstruction;

        const countdown = document.createElement("div");
        countdown.style.marginTop = "8px";
        countdown.style.opacity = "0.7";
        currentLine.appendChild(countdown);

        pauseInterval = setInterval(() => {
          countdown.textContent = `⏱ ${remaining}s`;
          remaining--;
          pauseRemaining = remaining;

          if (remaining < 0) {
            clearInterval(pauseInterval);
            pauseInterval = null;
            pauseRemaining = 0;
            resolve();
          }
        }, 1000);

        return;
      }

      // ----- TEXTE -----
      lastInstruction = item.text;
      currentLine.textContent = item.text;

      const utt = new SpeechSynthesisUtterance(item.text);

      // Voix calme
      utt.rate = 0.75;
      utt.pitch = 0.7;

      utt.onend = resolve;
      speechSynthesis.speak(utt);
    });
  }

  // =====================
  // Play
  // =====================
  async function play() {
    if (!currentRoutine || isPlaying) return;

    isPlaying = true;
    isPaused = false;
    speechSynthesis.cancel();

    startTime = pausedAt ? Date.now() - pausedAt : Date.now();

    btnStart.disabled = true;
    btnPause.disabled = false;
    btnStop.disabled  = false;

    while (currentIndex < currentRoutine.script.length) {
      if (isPaused) {
        isPlaying = false;
        return;
      }
      await speakItem(currentRoutine.script[currentIndex]);
      currentIndex++;
    }

    finish();
  }

  function finish() {
    isPlaying = false;
    pausedAt = 0;
    pauseRemaining = 0;

    btnStart.disabled = false;
    btnPause.disabled = true;
    btnStop.disabled  = true;

    currentLine.textContent = "Routine terminée 🌿";
  }

  // =====================
  // Boutons
  // =====================
  btnStart.addEventListener("click", play);

  btnPause.addEventListener("click", () => {
    if (!isPlaying) return;

    isPaused = true;
    pausedAt = Date.now() - startTime;

    speechSynthesis.cancel();
    if (pauseInterval) clearInterval(pauseInterval);

    btnStart.disabled = false;
    btnPause.disabled = true;

    currentLine.textContent = "⏸ En pause";
  });

  btnStop.addEventListener("click", () => {
    speechSynthesis.cancel();
    if (pauseInterval) clearInterval(pauseInterval);

    isPlaying = false;
    isPaused = false;
    currentIndex = 0;
    pausedAt = 0;
    pauseRemaining = 0;

    progressFill.style.width = "0%";
    timeLeft.textContent = formatTime(currentRoutine.duree_totale_sec);
    currentLine.textContent = "Arrêt.";

    btnStart.disabled = false;
    btnPause.disabled = true;
    btnStop.disabled  = true;
  });

  // =====================
  // Progression
  // =====================
  function updateProgress() {
    if (!currentRoutine || !startTime || isPaused) return;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, currentRoutine.duree_totale_sec - elapsed);

    timeLeft.textContent = formatTime(remaining);
    progressFill.style.width =
      Math.min(100, (elapsed / currentRoutine.duree_totale_sec) * 100) + "%";
  }

  timer = setInterval(updateProgress, 500);

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  }

});
