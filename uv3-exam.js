function uv3_wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

window.UV3 = {
  async start(kataMin, bunkaiMin) {
    await speak("Annoncez le kata que vous avez choisi");
    await uv3_wait(500);

    // timer kata
    await new Promise(res => {
      const duration = kataMin * 60;
      let remaining = duration;
      const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(interval);
          res();
        }
      }, 1000);
    });

    await speak("Présentez les bunkaïs choisis et les séquences du kata de référence");

    // timer bunkai
    await new Promise(res => {
      const duration = bunkaiMin * 60;
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
