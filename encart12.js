/********************************************************************
 * UV1 – Kihon (VERSION AVEC DING + LATENCES + VITESSE)
 ********************************************************************/
document.addEventListener("DOMContentLoaded", async () => {

  /********************************************************************
   * OUTILS COMMUNS
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
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  /********************************************************************
   * DONNÉES MODULE 1 & 3 (comme avant)
   ********************************************************************/
  // KS
  const ksJson = await loadJSON("kihon_simples.json");
  const KS_DATA = ksJson ? ksJson.kihon : [];

  // KC = ***PLUS UTILISÉ → remplacé par ton module 2 avancé***
  // mais on ne casse rien si JSON existe
  const kcJson = await loadJSON("kihon_enchainements_simples.json");
  const KC_DATA = kcJson ? kcJson["enchaînements"] : [];

  // KCB EN DUR FR
  const KCB_DATA = [
    { jp: "Oï Tsuki jodan" },
    { jp: "Gyaku Tsuki chudan" },
    { jp: "Kizami Tsuki jodan, Gyaku Tsuki Chudan" },
    { jp: "Mae Geri jambe arrière posée derrière" },
    { jp: "Mawashi Geri jambe arrière posée derrière" },
    { jp: "Mae Geri jambe avant avec sursaut" },
    { jp: "Mawashi Geri jambe avant avec sursaut" }
  ];

  /********************************************************************
   * MODULE GÉNÉRIQUE (module 1 et 3)
   ********************************************************************/
  function initModule(config) {
    const {
      countInput, intervalInput, intervalDisplayId,
      speedInput, speedDisplayId,
      btnRandom, btnRead, btnStop,
      outBox, beepIcon,
      data,
      lang = "ja-JP"
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
      runId++;
      running = false;
      speechSynthesis.cancel();
    });

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
      if (!sequence.length) btnRandom.click();
      if (!sequence.length) return;

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

        await speak(sequence[i].jp, lang, speed);
        if (i < sequence.length - 1) await wait(intervalMs);
      }

      await wait(intervalMs);
      if (myRun !== runId) return;
      if (beepEnabled) playBeep();
      running = false;
    });

    btnStop.addEventListener("click", () => {
      runId++;
      running = false;
      speechSynthesis.cancel();
    });

    btnRandom.click();
  }

  /********************************************************************
   * MODULE 1 – KIHON SIMPLES (inchangé)
   ********************************************************************/
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
    lang: "ja-JP"
  });

  /********************************************************************
   * MODULE 3 – KIHON COMBAT (FR, données en dur)
   ********************************************************************/
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
    lang: "fr-FR"
  });


  /********************************************************************
   * MODULE 2 — 🟢 TON MODULE AVANCÉ INTÉGRÉ TEL QUEL
   ********************************************************************/
  let enchainementsData = [];
  let techniquesDescriptions = [];
  let currentEnchainement = null;
  let selectedCategorie = null;
  let enchainementBeeper = null;
  let enchainementTimeouts = [];
  let isReadingEnchainement = false;
  let enchainementSpeechRate = 0.7;

  async function loadEnchainementData() {
    try {
      const response1 = await fetch("kihon_maj2025.json");
      enchainementsData = await response1.json();

      if (typeof techniques !== 'undefined' && techniques.length > 0) {
        techniquesDescriptions = techniques;
      } else {
        const response2 = await fetch("tjkihon.json");
        techniquesDescriptions = await response2.json();
      }

      initEnchainementUI();
      populateSpecialites();
    } catch (err) {
      console.error("❌ Erreur chargement données enchainements :", err);
    }
}

function initEnchainementUI() {
    const container = document.getElementById("enchainementSection");
    if (!container) return;
    
    const controls = document.createElement("div");
    controls.id = "enchainementControls";
    controls.innerHTML = `
        <div class="sub-section">
            <h3>🔗 Générateur d'Enchaînement</h3>
            <div>
                <label style="font-weight: bold; color: var(--accent);">Filtrer par spécialité :</label>
                <select id="filterSpecialite">
                    <option value="">Toutes les spécialités</option>
                </select>
            </div>
            
            <button id="btnNouveauEnchainement" class="btn-kawaii">🎲 Nouveau tirage</button>
            
            <div id="categorieAnnonce" style="text-align: center; font-size: 1.1rem; color: var(--accent); font-weight: bold; margin-top: 10px; min-height: 25px;"></div>
            
            <div id="enchainementResult" class="result-display" style="min-height: 100px; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                <p style="color: #999;">Cliquez pour commencer</p>
            </div>
        </div>

        <div class="sub-section">
            <h3>🔊 Contrôles Audio <span id="audioStatus"></span></h3>
            
            <div>
                <label style="font-weight: bold; color: var(--accent);">
                    Vitesse lecture JP : <span id="enchainementSpeedValue">×0.7</span>
                </label>
                <input type="range" id="enchainementSpeedSlider" min="0.3" max="2" step="0.1" value="0.7">
            </div>
            
            <button id="btnLectureJP" class="btn-kawaii btn-read">▶️ Lire en japonais (2 fois)</button>
            <p style="font-size: 0.8rem; color: #666; margin: 5px 0;">⚡ Le beeper démarre auto 5s après la 2ème lecture</p>
            
            <div style="margin-top: 10px;">
                <label style="font-weight: bold; color: var(--accent);">
                    Beeper : <span id="beeperFreqValue">3s</span>
                </label>
                <input type="range" id="beeperFreqSlider" min="1" max="10" step="1" value="3">
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 5px;">
                <button id="btnStartBeeper" class="btn-kawaii btn-start" style="flex:1;">🔔 Démarrer</button>
                <button id="btnStopBeeper" class="btn-kawaii btn-stop" style="flex:1;">⏹ Stop</button>
            </div>
        </div>
    `;
    container.appendChild(controls);
    
    attachEnchainementEvents();
}

function populateSpecialites() {
    const select = document.getElementById("filterSpecialite");
    if (!select) return;
    
    const allSpecs = new Set();
    enchainementsData.forEach(e => {
        if (e.specialite && Array.isArray(e.specialite)) {
            e.specialite.forEach(s => allSpecs.add(s));
        }
    });
    
    allSpecs.forEach(spec => {
        const option = document.createElement("option");
        option.value = spec;
        option.textContent = spec;
        select.appendChild(option);
    });
}

function attachEnchainementEvents() {
    document.getElementById("btnNouveauEnchainement")?.addEventListener("click", nouveauEnchainement);
    
    const speedSlider = document.getElementById("enchainementSpeedSlider");
    speedSlider?.addEventListener("input", (e) => {
        enchainementSpeechRate = parseFloat(e.target.value);
        document.getElementById("enchainementSpeedValue").textContent = `×${enchainementSpeechRate.toFixed(1)}`;
    });
    
    document.getElementById("btnLectureJP")?.addEventListener("click", lireEnchainementJaponais);
    
    const beeperSlider = document.getElementById("beeperFreqSlider");
    beeperSlider?.addEventListener("input", (e) => {
        document.getElementById("beeperFreqValue").textContent = `${e.target.value}s`;
    });
    
    document.getElementById("btnStartBeeper")?.addEventListener("click", startEnchainementBeeper);
    document.getElementById("btnStopBeeper")?.addEventListener("click", stopEnchainementBeeper);
}

// Nouveau tirage avec séquence complète
async function nouveauEnchainement() {
    const specialite = document.getElementById("filterSpecialite")?.value;
    let filtered = enchainementsData;
    
    if (specialite) {
        filtered = enchainementsData.filter(e => e.specialite && e.specialite.includes(specialite));
    }
    
    if (filtered.length === 0) {
        alert("Aucun enchainement trouvé pour cette spécialité");
        return;
    }
    
    // Nettoyer
    enchainementTimeouts.forEach(t => clearTimeout(t));
    enchainementTimeouts = [];
    stopEnchainementBeeper();
    speechSynthesis.cancel();
    
    // Sélection aléatoire
    currentEnchainement = filtered[Math.floor(Math.random() * filtered.length)];
    
    // Sélection catégorie aléatoire
    if (currentEnchainement.specialite && currentEnchainement.specialite.length > 0) {
        const randomIndex = Math.floor(Math.random() * currentEnchainement.specialite.length);
        selectedCategorie = currentEnchainement.specialite[randomIndex];
    } else {
        selectedCategorie = "Technique";
    }
    
    const resultDiv = document.getElementById("enchainementResult");
    const categorieDiv = document.getElementById("categorieAnnonce");
    const btn = document.getElementById("btnNouveauEnchainement");
    const statusSpan = document.getElementById("audioStatus");
    
    btn.disabled = true;
    isReadingEnchainement = true;
    
    resultDiv.innerHTML = `
        <div style="animation: fadeIn 0.4s;">
            <p style="font-size: 1.5rem; color: var(--accent);">⏳</p>
            <p id="countdown" style="font-size: 1.2rem; color: #666;">Préparation...</p>
        </div>
    `;
    categorieDiv.innerHTML = "";
    
    await unlockSpeechSynthesis();
    
    // Phase 1 : Préparation 5s
    statusSpan.innerHTML = '<span class="status-badge status-waiting">Préparation 5s</span>';
    updateCountdown("Préparation... 5s");
    
    enchainementTimeouts.push(setTimeout(async () => {
        // Annonce catégorie FR
        categorieDiv.innerHTML = `🏷️ ${selectedCategorie}`;
        statusSpan.innerHTML = '<span class="status-badge status-active">Annonce catégorie</span>';
        updateCountdown(`Catégorie : ${selectedCategorie}`);
        
        await speakFrench(selectedCategorie);
        
        // Phase 2 : Lecture JP 1
        statusSpan.innerHTML = '<span class="status-badge status-active">Lecture JP 1/2</span>';
        updateCountdown("Lecture japonaise 1/2...");
        
        speakJapanese(currentEnchainement.jp, () => {
            // Pause 5s
            statusSpan.innerHTML = '<span class="status-badge status-waiting">Pause 5s</span>';
            updateCountdown("Pause... 5s");
            
            enchainementTimeouts.push(setTimeout(() => {
                // Phase 3 : Lecture JP 2
                statusSpan.innerHTML = '<span class="status-badge status-active">Lecture JP 2/2</span>';
                updateCountdown("Lecture japonaise 2/2...");
                
                speakJapanese(currentEnchainement.jp, () => {
                    // Phase 4 : Attente 5s puis beeper + affichage
                    statusSpan.innerHTML = '<span class="status-badge status-waiting">Beeper dans 5s</span>';
                    updateCountdown("Beeper dans 5s...");
                    
                    enchainementTimeouts.push(setTimeout(() => {
                        // AFFICHER LA TECHNIQUE ICI
                        afficherEnchainement();
                        
                        // Démarrer le beeper
                        statusSpan.innerHTML = '<span class="status-badge status-active">Beeper actif</span>';
                        btn.disabled = false;
                        isReadingEnchainement = false;
                        startEnchainementBeeper();
                    }, 5000));
                });
            }, 5000));
        });
    }, 5000));
}

function updateCountdown(text) {
    const el = document.getElementById("countdown");
    if (el) el.textContent = text;
}

function speakFrench(text) {
    return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "fr-FR";
        utterance.rate = 0.9;
        utterance.onend = resolve;
        utterance.onerror = resolve;
        speechSynthesis.speak(utterance);
    });
}

function afficherEnchainement() {
    const resultDiv = document.getElementById("enchainementResult");
    if (!resultDiv || !currentEnchainement) return;
    
    resultDiv.innerHTML = `
        <div style="animation: fadeIn 0.4s;">
            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 8px; color: #333;">
                ${createClickableTerms(currentEnchainement.fr)}
            </div>
            <div style="font-size: 1.1rem; color: #666; font-style: italic;">
                ${currentEnchainement.jp}
            </div>
            <div style="margin-top: 8px; font-size: 0.8rem; color: var(--accent);">
                <em>Cliquez sur une technique pour la description</em>
            </div>
        </div>
    `;
}

function createClickableTerms(text) {
    const terms = text.split(/[,→]/);
    return terms.map(term => {
        const trimmed = term.trim();
        return `<span class="clickable-term" onclick="showTechniquePopup('${trimmed.replace(/'/g, "\\'")}')">${trimmed}</span>`;
    }).join(' → ');
}

function showTechniquePopup(termName) {
    const technique = techniquesDescriptions.find(t => 
        t.nom.toLowerCase() === termName.toLowerCase() ||
        t.nom.toLowerCase().includes(termName.toLowerCase()) ||
        termName.toLowerCase().includes(t.nom.toLowerCase())
    );
    
    const existingPopup = document.getElementById("techniquePopup");
    if (existingPopup) existingPopup.remove();
    const existingOverlay = document.getElementById("popupOverlay");
    if (existingOverlay) existingOverlay.remove();
    
    const popup = document.createElement("div");
    popup.id = "techniquePopup";
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; padding: 25px; border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 9999;
        max-width: 90%; width: 500px; max-height: 80vh; overflow-y: auto;
        animation: fadeIn 0.3s;
    `;
    
    if (technique) {
        let videoEmbed = '';
        if (technique.video) {
            let url = technique.video.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/");
            videoEmbed = `<iframe src="${url}" style="width: 100%; height: 200px; margin-top: 15px; border-radius: 10px;" frameborder="0" allowfullscreen></iframe>`;
        }
        
        popup.innerHTML = `
            <button onclick="this.parentElement.remove(); document.getElementById('popupOverlay')?.remove();" style="float: right; background: #ff4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">×</button>
            <h2 style="color: var(--accent); margin-bottom: 10px;">${technique.nom}</h2>
            <p style="font-style: italic; color: #666; margin-bottom: 10px;">Catégorie: ${technique.categorie}</p>
            <p style="line-height: 1.6;">${technique.description.replace(/\n/g, '<br>')}</p>
            ${videoEmbed}
        `;
    } else {
        popup.innerHTML = `
            <button onclick="this.parentElement.remove(); document.getElementById('popupOverlay')?.remove();" style="float: right; background: #ff4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">×</button>
            <h3 style="color: var(--accent);">${termName}</h3>
            <p style="color: #666;">Description non trouvée dans la base de données.</p>
        `;
    }
    
    document.body.appendChild(popup);
    
    const overlay = document.createElement("div");
    overlay.id = "popupOverlay";
    overlay.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); z-index: 9998;";
    overlay.onclick = () => {
        popup.remove();
        overlay.remove();
    };
    document.body.appendChild(overlay);
}

async function lireEnchainementJaponais() {
    if (!currentEnchainement || isReadingEnchainement) return;
    
    isReadingEnchainement = true;
    const btn = document.getElementById("btnLectureJP");
    const statusSpan = document.getElementById("audioStatus");
    const originalText = btn.textContent;
    
    btn.disabled = true;
    
    enchainementTimeouts.forEach(t => clearTimeout(t));
    enchainementTimeouts = [];
    
    await unlockSpeechSynthesis();
    
    btn.textContent = "⏳ Préparation (5s)...";
    statusSpan.innerHTML = '<span class="status-badge status-waiting">Préparation</span>';
    
    enchainementTimeouts.push(setTimeout(() => {
        btn.textContent = "🔊 Lecture 1/2...";
        statusSpan.innerHTML = '<span class="status-badge status-active">Lecture 1</span>';
        
        speakJapanese(currentEnchainement.jp, () => {
            btn.textContent = "⏸ Pause (5s)...";
            statusSpan.innerHTML = '<span class="status-badge status-waiting">Pause</span>';
            
            enchainementTimeouts.push(setTimeout(() => {
                btn.textContent = "🔊 Lecture 2/2...";
                statusSpan.innerHTML = '<span class="status-badge status-active">Lecture 2</span>';
                
                speakJapanese(currentEnchainement.jp, () => {
                    btn.textContent = "⏳ Beeper dans 5s...";
                    statusSpan.innerHTML = '<span class="status-badge status-waiting">Bientôt beeper</span>';
                    
                    enchainementTimeouts.push(setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                        isReadingEnchainement = false;
                        statusSpan.innerHTML = '<span class="status-badge status-active">Beeper actif</span>';
                        
                        startEnchainementBeeper();
                    }, 5000));
                });
            }, 5000));
        });
    }, 5000));
}

function speakJapanese(text, callback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = enchainementSpeechRate;
    utterance.onend = callback;
    utterance.onerror = () => {
        console.error("Erreur synthèse vocale");
        if (callback) callback();
    };
    speechSynthesis.speak(utterance);
}

function startEnchainementBeeper() {
    stopEnchainementBeeper();
    const freq = parseInt(document.getElementById("beeperFreqSlider")?.value || 3) * 1000;
    
    const topSound = new Audio("top.mp3");
    topSound.play().catch(e => console.log("Audio nécessite une interaction utilisateur"));
    
    enchainementBeeper = setInterval(() => {
        const sound = new Audio("top.mp3");
        sound.play().catch(e => {});
    }, freq);
    
    document.getElementById("btnStartBeeper").style.backgroundImage = "linear-gradient(120deg, #4CAF50 0%, #45a049 100%)";
    document.getElementById("btnStartBeeper").textContent = "🔔 Actif";
    
    const statusSpan = document.getElementById("audioStatus");
    if (statusSpan) {
        statusSpan.innerHTML = '<span class="status-badge status-active">Beeper actif</span>';
    }
}

function stopEnchainementBeeper() {
    if (enchainementBeeper) {
        clearInterval(enchainementBeeper);
        enchainementBeeper = null;
        document.getElementById("btnStartBeeper").style.backgroundImage = "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)";
        document.getElementById("btnStartBeeper").textContent = "🔔 Démarrer";
        
        const statusSpan = document.getElementById("audioStatus");
        if (statusSpan) {
            statusSpan.innerHTML = '';
        }
    }
    
    enchainementTimeouts.forEach(t => clearTimeout(t));
    enchainementTimeouts = [];
    
    speechSynthesis.cancel();
    
    const btn = document.getElementById("btnLectureJP");
    const btnTirage = document.getElementById("btnNouveauEnchainement");
    if (btn && isReadingEnchainement) {
        btn.textContent = "▶️ Lire en japonais (2 fois)";
        btn.disabled = false;
    }
    if (btnTirage) {
        btnTirage.disabled = false;
    }
    isReadingEnchainement = false;
}

async function unlockSpeechSynthesis() {
    return new Promise(resolve => {
        const utter = new SpeechSynthesisUtterance(".");
        utter.volume = 0.001;
        utter.onend = resolve;
        utter.onerror = resolve;
        speechSynthesis.speak(utter);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadEnchainementData();

});
