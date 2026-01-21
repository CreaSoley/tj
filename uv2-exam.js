/********************************************************************
 * UV2 – Ippon Kumite (EXAM VERSION)
 ********************************************************************/
(() => {

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
     * ÉLÉMENTS DOM
     ********************************************************************/
    const intervalInput = document.getElementById("uv2-interval");
    const beepToggle = document.getElementById("uv2-beep-toggle");
    const uv2Display = document.getElementById("currentText");

    /********************************************************************
     * VARIABLES
     ********************************************************************/
    let sequence = [...IPPON];
    let timer = null;
    let beepEnabled = true;

    /********************************************************************
     * OUTILS
     ********************************************************************/
    function playBeep() {
        new Audio("beep.mp3").play().catch(() => {});
    }

    function speakJP(text) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ja-JP";
        speechSynthesis.speak(u);
    }

    /********************************************************************
     * BIP ON/OFF
     ********************************************************************/
    beepToggle?.addEventListener("click", () => {
        beepEnabled = !beepEnabled;
        beepToggle.textContent = beepEnabled ? "Bip : ON" : "Bip : OFF";
        if (!beepEnabled) speechSynthesis.cancel();
    });

    /********************************************************************
     * LECTURE UV2 (appel depuis le simulateur)
     ********************************************************************/
    window.runUV2 = async function () {

        if (timer) return; // déjà en cours

        // reset affichage
        uv2Display.textContent = "";

        let i = 0;
        const interval = (parseInt(intervalInput?.value || 5) || 5) * 1000;

        if (beepEnabled) playBeep();

        timer = setInterval(() => {

            if (i >= sequence.length) {
                clearInterval(timer);
                timer = null;
                if (beepEnabled) playBeep();
                return;
            }

            const tech = sequence[i];
            uv2Display.textContent = tech.jp;
            speakJP(tech.jp);

            i++;

        }, interval);
    };

    /********************************************************************
     * STOP UV2
     ********************************************************************/
    window.stopUV2 = function () {
        if (timer) clearInterval(timer);
        timer = null;
        speechSynthesis.cancel();
    };

})();
