let wakeLock = null;

async function requestWakeLock() {
  if (!('wakeLock' in navigator)) {
    console.warn("Wake Lock non supporté");
    return;
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log("Wake Lock activé");

    wakeLock.addEventListener('release', () => {
      console.log("Wake Lock relâché");
    });

  } catch (err) {
    console.error("Erreur Wake Lock:", err);
  }
}

// Réactiver si l’utilisateur revient sur la page
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    requestWakeLock();
  }
});
