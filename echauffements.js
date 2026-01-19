document.addEventListener("DOMContentLoaded", () => {

  let data = [];
  let currentExercise = null;
  let currentIndex = 0;
  let startTime = null;
  let pausedAt = 0;
  let isPaused = false;
  let timer = null;

  const select = document.getElementById("selectEchauff");
  const presentation = document.getElementById("presentation");
  const scriptPreview = document.getElementById("scriptPreview");
  const scriptAccordion = document.getElementById("scriptAccordion");

  const progressFill = document.getElementById("progressFill");
  const timeLeft = document.getElementById("countdown");
  const timeTotal = document.getElementById("totalTime");

  const btnStart = document.getElementById("startBtn");
  const btnStop = document.getElementById("stopBtn");

  // -----------------------
  // Charger le JSON
  // -----------------------
  fetch("echauffements.json")
    .then(res => res.json())
    .then(json => {
      data = json.echauffements;
      populateSelect();
      loadExercise(data[0]);
    })
    .catch(err => console.error(err));

  function populateSelect() {
    select.innerHTML = "";
    data.forEach(ex => {
      const opt = document.createElement("option");
      opt.value = ex.id;
      opt.textContent = `${ex.id} – ${ex.nom}`;
      select.appendChild(opt);
    });
  }

  select.addEventListener("change", () => {
    const ex = data.find(e => e.id === select.value);
    if (ex) loadExercise(ex);
  });

  // -----------------------
  // Charger un échauffement
  // -----------------------
  function loadExercise(ex) {
    currentExercise = ex;
    currentIndex = 0;
    startTime = null;
    pausedAt = 0;
    isPaused = false;

    // affichage
    presentation.textContent = ex.presentation;
    document.getElementById("uv-title").textContent = `${ex.id} – ${ex.nom}`;

    // preview du script
    scriptPreview.innerHTML = "";
    ex.script.forEach(item => {
      const p = document.createElement("p");
      if (item.text) p.textContent = item.text;
      if (item.pause) p.textContent = `Pause : ${item.pause}s`;
      scriptPreview.appendChild(p);
    });

    // accordéon script
    scriptAccordion.innerHTML = "";
    ex.script.forEach((item, idx) => {
      const line = document.createElement("div");
      line.style.marginBottom = "8px";
      line.textContent = item.text ? item.text : `Pause : ${item.pause}s`;
      scriptAccordion.appendChild(line);
    });

    // calcul automatique du temps total
    const totalSec = calculateTotalSeconds(ex.script);
    ex.duree_totale_sec = totalSec;

    timeTotal.textContent = formatTime(totalSec);
    timeLeft.textContent = formatTime(totalSec);
    progressFill.style.width = "0%";
  }

  // -----------------------
  // Calcul du temps total
  // -----------------------
  function calculateTotalSeconds(script) {
    let total = 0;
    script.forEach(item => {
      if (item.pause) total += item.pause;
      else total += estimateSpeechDuration(item.text);
    });
    return Math.max(1, Math.floor(total));
  }

  // estimation simple de durée de parole (approx)
  function estimateSpeechDuration(text) {
    const words = text.split(" ").length;
    const wordsPerSec = 2.5; // voix lente à moyenne
    return words / wordsPerSec;
  }

  // -----------------------
  // Lecture vocale
  // -----------------------
  function speakItem(item) {
    return new Promise((resolve) => {
      if (item.pause) {
        setTimeout(resolve, item.pause * 1000);
        return;
      }

      const utt = new SpeechSynthesisUtterance(item.text);

      if (item.mode === "grave") {
        utt.rate = 0.7;
        utt.pitch = 0.6;
      } else if (item.mode === "rapide") {
        utt.rate = 1.05;
        utt.pitch = 1.0;
      } else {
        utt.rate = 0.9;
        utt.pitch = 0.85;
      }

      utt.onend = () => resolve();
      speechSynthesis.speak(utt);
    });
  }

  async function play() {
    if (!currentExercise) return;

    if (isPaused) {
      isPaused = false;
      startTime = Date.now() - pausedAt;
    } else {
      startTime = Date.now();
    }

    btnStart.disabled = true;
    btnStop.disabled = false;

    while (currentIndex < currentExercise.script.length) {
      if (isPaused) return;

      const item = currentExercise.script[currentIndex];
      await speakItem(item);
      currentIndex++;
    }

    btnStart.disabled = false;
  }

  // -----------------------
  // Stop
  // -----------------------
  btnStart.addEventListener("click", () => play());

  btnStop.addEventListener("click", () => {
    isPaused = false;
    currentIndex = 0;
    pausedAt = 0;
    startTime = null;
    speechSynthesis.cancel();
    btnStart.disabled = false;
    btnStop.disabled = true;
  });

  // -----------------------
  // Progression
  // -----------------------
  function updateProgress() {
    if (!currentExercise || !startTime) return;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, currentExercise.duree_totale_sec - elapsed);

    timeLeft.textContent = formatTime(remaining);
    const pct = Math.min(100, (elapsed / currentExercise.duree_totale_sec) * 100);
    progressFill.style.width = pct + "%";

    if (remaining <= 0) {
      clearInterval(timer);
    }
  }

  timer = setInterval(updateProgress, 500);

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

});
