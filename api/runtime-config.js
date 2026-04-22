module.exports = function handler(request, response) {
  response.setHeader("Content-Type", "application/javascript; charset=utf-8");

  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

  response.status(200).send(
    `window.__RUNTIME_CONFIG__ = ${JSON.stringify({
      SUPABASE_URL: supabaseUrl,
      SUPABASE_ANON_KEY: supabaseAnonKey
    })};`
  );
};
