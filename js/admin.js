(function () {
  const idInput = document.getElementById("admin-id");
  const passwordInput = document.getElementById("admin-password");
  const exportButton = document.getElementById("admin-export-btn");
  const feedback = document.getElementById("admin-feedback");

  if (!idInput || !passwordInput || !exportButton || !feedback) return;

  function setFeedback(message) {
    feedback.textContent = message;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function requestExport() {
    const adminId = idInput.value.trim();
    const adminPassword = passwordInput.value.trim();

    if (!adminId || !adminPassword) {
      setFeedback("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    exportButton.disabled = true;
    setFeedback("엑셀 파일을 준비 중입니다...");

    try {
      const response = await fetch("/api/admin-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, adminPassword })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "데이터 추출에 실패했습니다.");
      }

      const blob = await response.blob();
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `cafeteria-survey-${date}.csv`);
      setFeedback("다운로드가 완료되었습니다.");
    } catch (error) {
      setFeedback(error.message);
    } finally {
      exportButton.disabled = false;
    }
  }

  exportButton.addEventListener("click", requestExport);
})();
