function uv4_wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

window.UV4 = {
  async start(durationMin) {
    await speak("Unité de valeur : épreuves techniques");
    await speak("Exécutez 3 applications sur saisie à droite ou à gauche");
    await speak("Annoncez la technique de base choisie");

    await new Promise(res => {
      const duration = durationMin * 60;
      let remaining = duration;
      const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(interval);
          res();
        }
      }, 1000);
    });
  }
};
