let COMBINAISONS = [];

async function loadCombinaisons() {
  const res = await fetch("combinaisons.json");
  COMBINAISONS = await res.json();
}
