(function () {
  const SCORE_VALUES = [2, 1, 0, -1, -2];
  const SCORE_LABELS = ["+2", "+1", "0", "-1", "-2"];
  const SCORE_EMOJIS = ["😍", "😊", "😐", "😕", "😣"];
  const APP = window.APP_CONFIG;
  const QUESTIONS = window.RATING_QUESTIONS;

  let current = 0;
  let isDone = false;
  let isSubmitting = false;

  const elements = {
    appHeader: document.getElementById("app-header"),
    navBar: document.getElementById("nav-bar"),
    btnStartMain: document.getElementById("btn-start-main"),
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    progressFill: document.getElementById("progress-fill"),
    progressCount: document.getElementById("progress-count"),
    reason: document.getElementById("reason"),
    improvement: document.getElementById("improvement")
  };

  function renderRatingSlides() {
    QUESTIONS.forEach((question) => {
      const container = document.getElementById(`slide-${question.step}`);
      container.innerHTML = createQuestionHtml(question);
    });
  }

  function createQuestionHtml(question) {
    const optionsHtml = question.choices
      .map((label, index) => {
        const scoreClass = `opt-${5 - index}`;
        const inputId = `${question.key}-${SCORE_VALUES[index]}`;
        return `
          <div class="rating-option ${scoreClass}">
            <input type="radio" name="${question.key}" id="${inputId}" value="${SCORE_VALUES[index]}">
            <label for="${inputId}">
              <div class="score-pill">${SCORE_LABELS[index]}</div>
              <span class="opt-label">${label}</span>
              <span class="opt-emoji">${SCORE_EMOJIS[index]}</span>
            </label>
          </div>
        `;
      })
      .join("");

    return `
      <div class="q-step">항목 ${question.step} / 7</div><span class="q-icon">${question.icon}</span>
      <div class="q-title">${question.title}</div>
      <div class="q-desc">${question.description}</div>
      <div class="rating-group">${optionsHtml}</div>
      <div class="err-msg" id="err-${question.step}">⚠ 항목을 선택해 주세요.</div>
    `;
  }

  function showSlide(id) {
    document.querySelectorAll(".slide").forEach((slide) => slide.classList.remove("active"));
    document.getElementById(`slide-${id}`).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateUI() {
    const hideChrome = isDone || current === 0;
    elements.appHeader.style.display = hideChrome ? "none" : "";
    elements.navBar.style.display = hideChrome ? "none" : "flex";
    if (hideChrome) return;

    const progress = current === 0 ? 0 : Math.round((current / APP.totalSteps) * 100);
    elements.progressFill.style.width = `${progress}%`;
    elements.progressCount.textContent = current === 0 ? `0 / ${APP.totalSteps}` : `${current} / ${APP.totalSteps}`;

    elements.btnPrev.style.display = current > 0 ? "" : "none";
    if (current === 9) {
      elements.btnNext.textContent = "제출하기 ✓";
      elements.btnNext.className = "btn btn-submit";
    } else {
      elements.btnNext.textContent = "다음 →";
      elements.btnNext.className = "btn btn-next";
    }
  }

  function goTo(step) {
    current = step;
    showSlide(step);
    updateUI();
  }

  function goPrev() {
    if (current > 0) goTo(current - 1);
  }

  function validateCurrentStep() {
    if (current < 1 || current > 7) return true;
    const key = QUESTIONS[current - 1].key;
    const selected = document.querySelector(`input[name="${key}"]:checked`);
    const errEl = document.getElementById(`err-${current}`);
    if (!selected) {
      errEl.classList.add("show");
      return false;
    }
    errEl.classList.remove("show");
    return true;
  }

  function goNext() {
    if (current === 0) {
      goTo(1);
      return;
    }

    if (!validateCurrentStep()) return;
    if (current < 9) {
      goTo(current + 1);
      return;
    }
    submitSurvey();
  }

  function bindEvents() {
    elements.btnStartMain.addEventListener("click", () => goTo(1));
    elements.btnPrev.addEventListener("click", goPrev);
    elements.btnNext.addEventListener("click", goNext);

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.type !== "radio") return;
      if (current < 1 || current > 7) return;

      const errEl = document.getElementById(`err-${current}`);
      if (errEl) errEl.classList.remove("show");
      setTimeout(() => goTo(current + 1), 400);
    });
  }

  function getCheckedValue(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? Number(selected.value) : null;
  }

  function buildPayload() {
    return {
      taste: getCheckedValue("taste"),
      menu: getCheckedValue("menu"),
      salt: getCheckedValue("salt"),
      temperature: getCheckedValue("temp"),
      nutrition: getCheckedValue("nutrition"),
      hygiene: getCheckedValue("hygiene"),
      service: getCheckedValue("service"),
      reason: elements.reason.value.trim() || null,
      improvement: elements.improvement.value.trim() || null,
      submitted_at: new Date().toISOString()
    };
  }

  function isSupabaseConfigured() {
    return Boolean(APP.supabaseUrl && APP.supabaseAnonKey);
  }

  async function submitSurvey() {
    if (isSubmitting) return;
    isSubmitting = true;

    const payload = buildPayload();
    if (!isSupabaseConfigured()) {
      alert("Supabase 환경변수가 설정되지 않았습니다. README를 확인해 주세요.");
      console.log("제출 데이터(로컬 확인용):", payload);
      isSubmitting = false;
      return;
    }

    try {
      const response = await fetch(`${APP.supabaseUrl}/rest/v1/${APP.tableName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: APP.supabaseAnonKey,
          Authorization: `Bearer ${APP.supabaseAnonKey}`,
          Prefer: "return=minimal"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(await response.text());
    } catch (error) {
      console.error("제출 오류:", error);
      alert(`제출 중 오류가 발생했습니다.\n\n${error.message}`);
      isSubmitting = false;
      return;
    }

    isDone = true;
    showSlide("thanks");
    updateUI();
    isSubmitting = false;
  }

  function injectRuntimeEnv() {
    const fromGlobal = window.__RUNTIME_CONFIG__;
    if (!fromGlobal) return;
    if (fromGlobal.SUPABASE_URL) APP.supabaseUrl = fromGlobal.SUPABASE_URL;
    if (fromGlobal.SUPABASE_ANON_KEY) APP.supabaseAnonKey = fromGlobal.SUPABASE_ANON_KEY;
  }

  injectRuntimeEnv();
  renderRatingSlides();
  bindEvents();
  updateUI();
})();
