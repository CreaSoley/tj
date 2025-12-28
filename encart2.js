/********************************************************************
 * UV2 – Ippon Kumite (FINAL VERSION)
 ********************************************************************/
document.addEventListener("DOMContentLoaded", () => {

    /********************************************************************
     * DONNÉES
     ********************************************************************/
    const IPPON = [
        { romaji: "Oi Tsuki Jodan", jp: "オイヅキ ジョウダン" },
{ romaji: "Oi Tsuki Chudan", jp: "オイヅキ チュウダン" },
{ romaji: "Mae Geri Chudan", jp: "マエゲリ チュウダン" },
{ romaji: "Mawashi Geri Chudan", jp: "マワシゲリ チュウダン" },
{ romaji: "Yoko Geri Chudan", jp: "ヨコゲリ チュウダン" },

{ romaji: "Oi Tsuki Jodan", jp: "オイヅキ ジョウダン" },
{ romaji: "Oi Tsuki Chudan", jp: "オイヅキ チュウダン" },
{ romaji: "Mae Geri Chudan", jp: "マエゲリ チュウダン" },
{ romaji: "Mawashi Geri Chudan", jp: "マワシゲリ チュウダン" },
{ romaji: "Yoko Geri Chudan", jp: "ヨコゲリ チュウダン" }
        
    ];

    /********************************************************************
     * OUTILS
     ********************************************************************/
    function playBeep() {
        new Audio("beep.mp3").play().catch(e => console.log("Beep failed, maybe no file?"));
    }

    function speakJP(text) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ja-JP";
        speechSynthesis.speak(u);
    }

    /********************************************************************
     * SÉLECTEURS DOM
     ********************************************************************/
    const intervalInput = document.getElementById("uv2-interval");
    const intervalDisplay = document.getElementById("uv2-interval-display");
    const beepIcon = document.getElementById("uv2-beep");
    const outBox = document.getElementById("uv2-content");
    const btnRead = document.getElementById("uv2-read");
    const btnStop = document.getElementById("uv2-stop");
    const btnGenerate = document.getElementById("uv2-generate");

    /********************************************************************
     * VARIABLES
     ********************************************************************/
    let sequence = [...IPPON];  // ordre initial
    let timer = null;
    let beepEnabled = true;

    /********************************************************************
     * AFFICHAGE INITIAL
     ********************************************************************/
    function display() {
        // Utilisation de <div> pour une meilleure mise en forme dans le result-box
        outBox.innerHTML = sequence.map(t => `<div>${t.jp}</div>`).join("");
    }
    display();

    /********************************************************************
     * BIP ON/OFF
     ********************************************************************/
    beepIcon.addEventListener("click", () => {
        beepEnabled = !beepEnabled;
        beepIcon.classList.toggle("off", !beepEnabled);
        if (!beepEnabled) speechSynthesis.cancel();
    });

    /********************************************************************
     * SLIDER
     ********************************************************************/
    intervalInput.addEventListener("input", () => {
        intervalDisplay.textContent = intervalInput.value + "s";
    });

    /********************************************************************
     * CHANGER ORDRE (random)
     ********************************************************************/
    btnGenerate.addEventListener("click", () => {
        sequence = [...IPPON].sort(() => 0.5 - Math.random());
        display();
        if (beepEnabled) playBeep();
    });

    /********************************************************************
     * LECTURE
     ********************************************************************/
    btnRead.addEventListener("click", () => {
        if (timer) return;

        let i = 0;
        const interval = parseInt(intervalInput.value) * 1000;

        if (beepEnabled) playBeep();

        timer = setInterval(() => {
            if (i >= sequence.length) {
                clearInterval(timer);
                timer = null;
                if (beepEnabled) playBeep();
                return;
            }
            speakJP(sequence[i].jp);
            i++;
        }, interval);
    });

    /********************************************************************
     * STOP
     ********************************************************************/
    btnStop.addEventListener("click", () => {
        if (timer) clearInterval(timer);
        timer = null;
        speechSynthesis.cancel();
    });

});
