const ADMIN_ID = "guamct";
const ADMIN_PASSWORD = "hosp7533";

function toCsvValue(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows) {
  const columns = [
    { key: "id", label: "번호" },
    { key: "taste", label: "음식 맛" },
    { key: "menu", label: "식단 구성" },
    { key: "salt", label: "간(염도)" },
    { key: "temperature", label: "음식 온도" },
    { key: "nutrition", label: "영양 균형" },
    { key: "hygiene", label: "위생 상태" },
    { key: "service", label: "친절도" },
    { key: "reason", label: "이용하지 않는 이유" },
    { key: "improvement", label: "개선 필요 사항" },
    { key: "submitted_at", label: "제출 일시" },
    { key: "created_at", label: "생성 일시" }
  ];

  const lines = [columns.map((column) => column.label).join(",")];
  rows.forEach((row) => {
    const line = columns.map((column) => toCsvValue(row[column.key])).join(",");
    lines.push(line);
  });

  return "\uFEFF" + lines.join("\n");
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).send("허용되지 않은 메서드입니다.");
    return;
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body || {};
  const adminId = body.adminId;
  const adminPassword = body.adminPassword;
  if (adminId !== ADMIN_ID || adminPassword !== ADMIN_PASSWORD) {
    response.status(401).send("관리자 인증에 실패했습니다.");
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    response.status(500).send("서버 환경변수가 설정되지 않았습니다.");
    return;
  }

  try {
    const query = "select=id,taste,menu,salt,temperature,nutrition,hygiene,service,reason,improvement,submitted_at,created_at&order=submitted_at.desc";
    const apiResponse = await fetch(`${supabaseUrl}/rest/v1/cafeteria_survey?${query}`, {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`
      }
    });

    if (!apiResponse.ok) {
      throw new Error(await apiResponse.text());
    }

    const rows = await apiResponse.json();
    const csv = toCsv(rows);

    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", "attachment; filename=cafeteria-survey.csv");
    response.status(200).send(csv);
  } catch (error) {
    response.status(500).send(`데이터 조회에 실패했습니다: ${error.message}`);
  }
};
