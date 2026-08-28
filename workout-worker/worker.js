// FORGE workout telemetry — Cloudflare Worker + D1
// Receives logged sets (POST) and returns the full log (GET) for the Progress panel.
// See WORKER-SETUP.md for the ~15-min setup.

const CORS = {
  "Access-Control-Allow-Origin": "*", // lock to "https://<you>.github.io" once it works, if you like
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,X-Token",
};
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...CORS, "Content-Type": "application/json" } });

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS }); // CORS preflight
    if (req.headers.get("X-Token") !== env.SECRET) return json({ error: "unauthorized" }, 401);

    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      await env.DB.prepare(
        "INSERT INTO log(ts,event,plan,day,exercise,sr,target,weight) VALUES(?,?,?,?,?,?,?,?)"
      ).bind(
        new Date().toISOString(),
        b.event || "done", b.plan || "", b.day || "",
        b.exercise || "", b.sr || "", b.target || "",
        (b.weight == null || b.weight === "") ? null : Number(b.weight)
      ).run();
      return json({ ok: true });
    }

    // GET → whole log, oldest first
    const { results } = await env.DB.prepare("SELECT * FROM log ORDER BY ts").all();
    return json(results);
  },
};
