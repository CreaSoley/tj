const UV56 = (() => {

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
    "Saisie de poignet direct","Saisie de poignet opposé","Saisie de poignet opposé","Saisie de poignet haut",
    "Saisie des deux poignets bas","Saisie des deux poignets haut","Saisie d'un poignet à deux mains",
    "Étranglement de face à une main","Étranglement de face à deux mains",
    "Saisie de revers + mawashi tsuki","Saisie de cheveux",
    "Saisie manche haute","Saisie manche basse"
  ];

  function pick(list,count){
    const copy=list.slice();
    const out=[];
    while(out.length<count && copy.length>0){
      const i=Math.floor(Math.random()*copy.length);
      out.push(copy.splice(i,1)[0]);
    }
    return out;
  }

  let uv5Timer = null;
  let uv6Timer = null;

  function startUV5(intervalSec, count, speakFR){
    stopUV5();
    const list = pick(CAT_A, count);
    let i = 0;

    function loop(){
      if(i >= list.length) return;
      speakFR(list[i]);
      i++;
      uv5Timer = setTimeout(loop, intervalSec*1000);
    }
    loop();
  }

  function stopUV5(){
    if(uv5Timer) clearTimeout(uv5Timer);
    uv5Timer = null;
  }

  function startUV6(intervalSec, count, speakFR){
    stopUV6();
    const list = pick(LIST_ALL, count);
    let i = 0;

    function loop(){
      if(i >= list.length) return;
      speakFR(list[i]);
      i++;
      uv6Timer = setTimeout(loop, intervalSec*1000);
    }
    loop();
  }

  function stopUV6(){
    if(uv6Timer) clearTimeout(uv6Timer);
    uv6Timer = null;
  }

  return { startUV5, stopUV5, startUV6, stopUV6 };
})();
