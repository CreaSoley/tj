let wakeLock = null;

window.enableWakeLock = async function () {
  if (!('wakeLock' in navigator)) {
    console.warn("Wake Lock non supporté");
    return;
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log("🔓 Wake Lock activé");

    wakeLock.addEventListener('release', () => {
      console.log("🔒 Wake Lock relâché");
    });

  } catch (err) {
    console.error("Erreur Wake Lock:", err);
  }
};

window.disableWakeLock = async function () {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
    console.log("🔒 Wake Lock désactivé");
  }
};
