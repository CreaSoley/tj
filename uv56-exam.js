/*******************************************************
 * encart56.js
 * Gestion UV5 & UV6 :
 * - Filtres A/B/Toutes
 * - Doublons
 * - Génération aléatoire
 * - Lecture FR (ding + beep)
 * - Timer bip indépendant (ON/OFF)
 *******************************************************/

function $(id){ return document.getElementById(id); }
function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
function speakFR(txt){
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "fr-FR";
    u.rate = 0.97;
    speechSynthesis.speak(u);
}

/* -------------------------------------------------
   LISTES UV5/6
-------------------------------------------------- */
const LIST_ALL = [
    "Saisie de poignet direct","Saisie de poignet opposé","Saisie de poignet haut",
    "Saisie des deux poignets bas","Saisie des deux poignets haut","Saisie d'un poignet à deux mains",
    "Étranglement de face à une main","Étranglement de face à deux mains","Saisie de revers + mawashi tsuki",
    "Saisie de cheveux","Attaque couteau basse ou pique","Attaque couteau circulaire",
    "Attaque couteau revers","Attaque couteau haute","Matraque haute","Matraque revers",
    "Coup de poing direct","Mawashi tsuki gauche","Mawashi tsuki droit",
    "Saisie manche haute","Saisie manche basse"
];

const CAT_A = [
    "Saisie de poignet direct","Saisie de poignet opposé","Saisie de poignet haut",
    "Saisie des deux poignets bas","Saisie des deux poignets haut","Saisie d'un poignet à deux mains",
    "Étranglement de face à une main","Étranglement de face à deux mains",
    "Saisie de revers + mawashi tsuki","Saisie de cheveux",
    "Saisie manche haute","Saisie manche basse"
];

const CAT_B = [
    "Attaque couteau basse ou pique","Attaque couteau circulaire","Attaque couteau revers",
    "Attaque couteau haute","Matraque haute","Matraque revers",
    "Coup de poing direct","Mawashi tsuki gauche","Mawashi tsuki droit"
];

/* -------------------------------------------------
   OUTILS
-------------------------------------------------- */
function getBase(cat){
    switch(cat){
        case "A": return CAT_A.slice();
        case "B": return CAT_B.slice();
        default: return LIST_ALL.slice();
    }
}

function pick(list,count,allowDup){
    if(allowDup){
        const out=[];
        for(let i=0;i<count;i++)
            out.push(list[Math.floor(Math.random()*list.length)]);
        return out;
    } else {
        const copy=list.slice();
        const out=[];
        while(out.length<count && copy.length>0){
            const i=Math.floor(Math.random()*copy.length);
            out.push(copy.splice(i,1)[0]);
        }
        return out;
    }
}

/* -------------------------------------------------
   MODULE GÉNÉRALISÉ UV5/UV6
-------------------------------------------------- */

function RandoriModule(cfg){
    let reading = false;
    let beeping = false;
    let readTimer = null;
    let beepTimer = null;
    let selection = [];

    const ding = new Audio("ding.mp3");
    const beep = new Audio("beep.mp3");

    /* --- Générer une liste --- */
    function generate(){
        const cat = $(cfg.filter).value;
        const allowDup = $(cfg.duplicates).checked;
        const count = clamp(parseInt($(cfg.count).value)||5,1,30);

        const base = getBase(cat);
        selection = pick(base,count,allowDup);

        $(cfg.result).innerHTML = selection.map(
            (x,i)=>`<p><b>${i+1}.</b> ${x}</p>`
        ).join("");
    }

    /* --- Lecture FR --- */
    function read(){
        if(selection.length===0) return;
        if(reading) return;

        reading = true;
        const intervalMs = (parseInt($(cfg.readInterval).value)||15)*1000;

        let i=0;

        function step(){
            if(!reading) return;

            if(i>=selection.length){
                try{ beep.play(); }catch(e){}
                reading=false;
                return;
            }

            try{ ding.currentTime=0; ding.play(); }catch(e){}

            setTimeout(()=>{
                if(!reading) return;
                speakFR(selection[i]);
                i++;
                readTimer = setTimeout(step, intervalMs);
            },400);
        }

        readTimer = setTimeout(step, 5000);
    }

    /* --- Stop lecture --- */
    function stop(){
        reading=false;
        if(readTimer){ clearTimeout(readTimer); readTimer=null; }
        speechSynthesis.cancel();
    }

    /* --- Beeper indépendant --- */
    function startBeep(){
        if(beeping) return;

        beeping = true;
        $(cfg.beepIcon).textContent = "🔊";

        function ping(){
            if(!beeping) return;

            try{
                const snd = new Audio("bip.mp3");
                snd.play();
            }catch(e){}

            const t = (parseInt($(cfg.beepInterval).value)||10)*1000;
            beepTimer = setTimeout(ping, t);
        }
        ping();
    }

    function stopBeep(){
        beeping=false;
        $(cfg.beepIcon).textContent = "🔇";
        if(beepTimer){ clearTimeout(beepTimer); beepTimer=null; }
    }

    /* --- Sliders affichage valeurs --- */
    function wireSliders(){
        $(cfg.readInterval).addEventListener("input", ()=>{
            $(cfg.readDisplay).textContent = $(cfg.readInterval).value+"s";
        });
        $(cfg.beepInterval).addEventListener("input", ()=>{
            $(cfg.beepDisplay).textContent = $(cfg.beepInterval).value+"s";
        });
    }

    /* --- Wiring boutons --- */
    function wireButtons(){
        $(cfg.generate).addEventListener("click", generate);
        $(cfg.readBtn).addEventListener("click", read);
        $(cfg.stopBtn).addEventListener("click", stop);
        $(cfg.beepStart).addEventListener("click", startBeep);
        $(cfg.beepStop).addEventListener("click", stopBeep);
    }

    /* --- Init --- */
    function init(){
        wireSliders();
        wireButtons();
        generate();
    }

    init();
}


/* -------------------------------------------------
   INITIALISATION UV5 & UV6
-------------------------------------------------- */
document.addEventListener("DOMContentLoaded", ()=>{

    RandoriModule({
        // UV5
        filter: "uv5-filter",
        duplicates: "uv5-duplicates",
        count: "uv5-count",
        result: "uv5-result",

        readInterval: "uv5-read-interval",
        readDisplay: "uv5-read-interval-display",
        readBtn: "uv5-read",
        stopBtn: "uv5-stop",

        generate: "uv5-generate",

        beepInterval: "uv5-beep-interval",
        beepDisplay: "uv5-beep-display",
        beepStart: "uv5-beep-start",
        beepStop: "uv5-beep-stop",
        beepIcon: "uv5-beep-icon"
    });

    RandoriModule({
        // UV6
        filter: "uv6-filter",
        duplicates: "uv6-duplicates",
        count: "uv6-count",
        result: "uv6-result",

        readInterval: "uv6-read-interval",
        readDisplay: "uv6-read-interval-display",
        readBtn: "uv6-read",
        stopBtn: "uv6-stop",

        generate: "uv6-generate",

        beepInterval: "uv6-beep-interval",
        beepDisplay: "uv6-beep-display",
        beepStart: "uv6-beep-start",
        beepStop: "uv6-beep-stop",
        beepIcon: "uv6-beep-icon"
    });
});
// -------------------------------------------------
// API publique (pour le simulateur global)
// -------------------------------------------------
window.Encart56 = {
  startUV5: function() {
    document.getElementById("uv5-generate").click();
    document.getElementById("uv5-read").click();
  },
  startUV6: function() {
    document.getElementById("uv6-generate").click();
    document.getElementById("uv6-read").click();
  },
  stopUV5: function() {
    document.getElementById("uv5-stop").click();
  },
  stopUV6: function() {
    document.getElementById("uv6-stop").click();
  }
};
