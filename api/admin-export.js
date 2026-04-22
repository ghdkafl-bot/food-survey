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
  const headers = [
    "id",
    "taste",
    "menu",
    "salt",
    "temperature",
    "nutrition",
    "hygiene",
    "service",
    "reason",
    "improvement",
    "submitted_at",
    "created_at"
  ];

  const lines = [headers.join(",")];
  rows.forEach((row) => {
    const line = headers.map((key) => toCsvValue(row[key])).join(",");
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
