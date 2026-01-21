/*******************************************************
 * uv56-exam.js
 * Gestion UV5 & UV6 (lecture FR + tirage aléatoire)
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
   MODULE UV5/UV6
-------------------------------------------------- */

function RandoriModule(cfg){
    // Protection si le HTML n'existe pas (évite l'erreur addEventListener)
    if(!document.getElementById(cfg.filter)) return;

    let reading = false;
    let readTimer = null;
    let selection = [];

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
                reading=false;
                return;
            }

            speakFR(selection[i]);
            i++;
            readTimer = setTimeout(step, intervalMs);
        }

        readTimer = setTimeout(step, 5000);
    }

    /* --- Stop lecture --- */
    function stop(){
        reading=false;
        if(readTimer){ clearTimeout(readTimer); readTimer=null; }
        speechSynthesis.cancel();
    }

    /* --- Wiring boutons --- */
    function wireButtons(){
        $(cfg.generate).addEventListener("click", generate);
        $(cfg.readBtn).addEventListener("click", read);
        $(cfg.stopBtn).addEventListener("click", stop);
    }

    /* --- Init --- */
    function init(){
        wireButtons();
        generate();
    }

    init();

    // Expose stop for simulateur global
    return {
        stop
    };
}

/* -------------------------------------------------
   INIT UV5 & UV6
-------------------------------------------------- */

let UV56 = {
  uv5: null,
  uv6: null,
  stopUV5: function(){ if(this.uv5) this.uv5.stop(); },
  stopUV6: function(){ if(this.uv6) this.uv6.stop(); },
  startUV5: function(intervalSec, count){
    // on force le compteur et intervalle dans le module
    if(!document.getElementById("uv5-count")) return;
    document.getElementById("uv5-count").value = count;
    document.getElementById("uv5-read-interval").value = intervalSec;
    this.uv5 = RandoriModule({
        filter: "uv5-filter",
        duplicates: "uv5-duplicates",
        count: "uv
