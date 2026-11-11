import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

// Guarda a inscrição de notificação de cada aparelho e os horários dos lembretes.
// GET devolve a chave pública; PUT grava/atualiza; DELETE apaga.
const MAX = 60_000;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const keyOf = (endpoint) => createHash("sha256").update(String(endpoint)).digest("hex").slice(0, 40);

export default async (req) => {
  const store = getStore({ name: "lembretes", consistency: "strong" });
  if (req.method === "GET") return json({ key: process.env.VAPID_PUBLIC_KEY || null });

  const body = await req.text();
  if (body.length > MAX) return json({ erro: "grande demais" }, 413);
  let data;
  try { data = JSON.parse(body); } catch { return json({ erro: "json invalido" }, 400); }

  if (req.method === "DELETE") {
    if (!data || !data.endpoint) return json({ erro: "sem endpoint" }, 400);
    await store.delete(keyOf(data.endpoint));
    return json({ ok: true });
  }
  if (req.method === "PUT") {
    const sub = data && data.sub, plan = data && data.plan;
    if (!sub || typeof sub.endpoint !== "string" || !/^https:\/\//.test(sub.endpoint) || !sub.keys || !plan || !Array.isArray(plan.water) || !plan.week) return json({ erro: "formato invalido" }, 400);
    const k = keyOf(sub.endpoint);
    const old = await store.get(k, { type: "json" });
    await store.setJSON(k, { sub, plan, sent: (old && old.sent) || {}, at: Date.now() });
    return json({ ok: true });
  }
  return json({ erro: "metodo nao permitido" }, 405);
};

export const config = { path: "/api/push" };
