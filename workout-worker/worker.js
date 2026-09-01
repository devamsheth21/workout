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
        "INSERT INTO log(ts,event,plan,day,exercise,sr,target,weight,mode,entry_id,mins,dist) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)"
      ).bind(
        b.ts || new Date().toISOString(),  // trust the client's timestamp so back-dated entries land on the right day
        b.event || "done", b.plan || "", b.day || "",
        b.exercise || "", b.sr || "", b.target || "",
        (b.weight == null || b.weight === "") ? null : Number(b.weight),
        b.mode || "",  // each | bar | stack | bw (weight-entry convention) — also "bw"/"waist" body-log events
        b.id || "",    // stable per-set id; an "undo" event with the same id retracts it in the Progress panel
        (b.mins == null || b.mins === "") ? null : Number(b.mins),  // activity duration (minutes)
        (b.dist == null || b.dist === "") ? null : Number(b.dist)   // activity distance (miles)
      ).run();
      return json({ ok: true });
    }

    // GET → whole log, oldest first. Alias entry_id→id so the page can net out "undo" events.
    const { results } = await env.DB.prepare(
      "SELECT ts,event,plan,day,exercise,sr,target,weight,mode,entry_id AS id,mins,dist FROM log ORDER BY ts"
    ).all();
    return json(results);
  },
};
