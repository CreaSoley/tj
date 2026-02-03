// 🌟 Exécution séquence UV1 optimisée
async function runUV1Sequence(sequence) {
  for (const ex of sequence) {
    if (stopped) return;

    // ✅ Changer le fond selon la catégorie
    setUV1Background(ex.cat);

    // ✅ Annonce officielle si présente
    if (ex.announce) await speakFR(ex.announce);

    // 🖥 Affichage Romaji avec / pour lisibilité
    uv1Text.textContent = normalizeSegments(ex.jp_romaji).join(" / ");

    // 🇫🇷 Affichage traduction française
    uv1Translation.textContent = ex.fr || "";

    // 🇯🇵 Lecture Katakana segmentée (pause entre lignes)
    if (ex.jp_katakana) {
      const katakanaSegments = normalizeSegments(ex.jp_katakana);
      for (const line of katakanaSegments) {
        await new Promise(resolve => {
          const u = new SpeechSynthesisUtterance(line);
          u.lang = "ja-JP";
          u.rate = 0.7;
          u.onend = resolve;
          speechSynthesis.speak(u);
        });
        await waitMs(400); // pause entre segments
      }
    }

    // 🇫🇷 Lecture du français une seule fois
    if (ex.fr) {
      await speakFR(ex.fr);
    }

    // 🔔 Annonce garde si présente
    if (ex.garde) await speakFR("Garde à " + ex.garde);

    // 🔔 Début de l'exercice
    await speakFR("Hajimé");

    // ⏱ Timer
    let t = ex.time || 30;
    uv1Timer.textContent = format(t);

    while (t > 0) {
      if (stopped) return;
      if (!paused) {
        await waitMs(1000);
        t--;
        uv1Timer.textContent = format(t);
      } else {
        await waitMs(300);
      }
    }
  }
}
