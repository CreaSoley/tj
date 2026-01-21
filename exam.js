/* ===================== EXAM MODULE ===================== */
window.ExamModule = (() => {

  function buildExam() {
    return buildExamSequence(); // utilise TA fonction existante
  }

  async function startExam() {
    examMode = true;
    stopped = false;
    paused = false;
    index = 0;
    workedSeconds = 0;

    recap.classList.add("hidden");
    sequence = buildExam();
    run._started = false;

    await run();
  }

  return {
    startExam
  };

})();
