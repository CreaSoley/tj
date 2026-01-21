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
  const btnPause = document.getElementById("pauseBtn");
  const btnStop  = document.getElementById("stopBtn");


  btnPause.id = "pauseBtn";
  btnPause.className = "btn-kawaii";
  btnPause.textContent = "Pause";
  btnPause.disabled = true;
  document.querySelector(".button-row").insertBefore(btnPause, btnStop);

  const WORDS_PER_MINUTE = 130; // débit lent et dramatique

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
  isPaused = false;
  isPlaying = false;
  startTime = null;
  pausedAt = 0;

  // Présentation
  presentation.textContent = ex.presentation;
  presentation.classList.add("fredoka");

  document.getElementById("uv-title").textContent = `${ex.id} – ${ex.nom}`;

  // Accordéon
  scriptAccordion.innerHTML = "";
  ex.script.forEach(item => {
    const line = document.createElement("div");
    line.style.marginBottom = "6px";

    if (item.text) {
      line.textContent = "🗣 " + item.text;
    } else {
      line.textContent = `⏸ Pause ${item.pause}s`;
      line.style.opacity = "0.6";
      line.style.fontStyle = "italic";
    }

    scriptAccordion.appendChild(line);
  });

  // Durée auto
  currentExercise.duree_totale_sec = calculateDuration(ex.script);
  timeTotal.textContent = formatTime(currentExercise.duree_totale_sec);
  timeLeft.textContent  = formatTime(currentExercise.duree_totale_sec);

  progressFill.style.width = "0%";

  // Boutons
  btnStart.disabled = false;
  btnPause.disabled = true;
  btnStop.disabled  = true;
}

  // -----------------------
  // Calcul durée totale
  // -----------------------
  function calculateDuration(script) {
    let totalPause = 0;
    let totalWords = 0;

    script.forEach(item => {
      if (item.pause) totalPause += item.pause;
      if (item.text) totalWords += item.text.split(" ").length;
    });

    const speechTimeSec = (totalWords / WORDS_PER_MINUTE) * 60;
    return Math.round(totalPause + speechTimeSec);
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
  if (!currentExercise || isPlaying) return;

  // sécurité : stoppe toute synthèse en cours
  speechSynthesis.cancel();

  isPlaying = true;

  if (isPaused) {
    isPaused = false;
    startTime = Date.now() - pausedAt;
  } else {
    startTime = Date.now();
    currentIndex = 0;
  }

  btnStart.disabled = false;
  btnPause.disabled = true;
  btnStop.disabled  = true;


  while (currentIndex < currentExercise.script.length) {
    if (isPaused) {
      isPlaying = false;
      return;
    }

    const item = currentExercise.script[currentIndex];
    await speakItem(item);
    currentIndex++;
  }

  isPlaying = false;
  btnStart.disabled = false;
  btnPause.disabled = true;
}


  // -----------------------
  // Pause / Stop
  // -----------------------
 btnStart.addEventListener("click", () => {
  if (isPlaying) return;
  play();
});


  btnPause.addEventListener("click", () => {
  if (!isPlaying) return;

  isPaused = true;
  isPlaying = false;
  pausedAt = Date.now() - startTime;

  speechSynthesis.cancel();

  btnStart.disabled = false;
  btnPause.disabled = true;
});


  btnStop.addEventListener("click", () => {
  speechSynthesis.cancel();

  isPaused = false;
  isPlaying = false;
  currentIndex = 0;
  startTime = null;
  pausedAt = 0;

  progressFill.style.width = "0%";
  timeLeft.textContent = formatTime(currentExercise.duree_totale_sec);

  btnStart.disabled = false;
  btnPause.disabled = true;
  btnStop.disabled  = true;
});


  // -----------------------
  // Progression
  // -----------------------
  function updateProgress() {
    if (!currentExercise || !startTime || isPaused) return;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, currentExercise.duree_totale_sec - elapsed);

    timeLeft.textContent = formatTime(remaining);
    const pct = Math.min(100, (elapsed / currentExercise.duree_totale_sec) * 100);
    progressFill.style.width = pct + "%";

    if (remaining <= 0) {
      clearInterval(timer);
      btnStart.disabled = false;
      btnPause.disabled = true;
    }
  }

  timer = setInterval(updateProgress, 500);

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

});
