import { getStore } from "@netlify/blobs";

// Guarda e devolve a dieta pelo "código da dieta" (ex.: ABCD-EFGH-JKLM).
const CODE = /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const MAX = 400_000; // ~400 KB é muito mais que uma dieta precisa
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export default async (req) => {
  const url = new URL(req.url);
  const code = (url.searchParams.get("codigo") || "").toUpperCase().trim();
  if (!CODE.test(code)) return json({ erro: "codigo invalido" }, 400);
  const store = getStore({ name: "dietas", consistency: "strong" });

  if (req.method === "GET") {
    const data = await store.get(code, { type: "json" });
    return data ? json(data) : json({ erro: "nao encontrado" }, 404);
  }
  if (req.method === "PUT") {
    const body = await req.text();
    if (body.length > MAX) return json({ erro: "grande demais" }, 413);
    let data;
    try { data = JSON.parse(body); } catch { return json({ erro: "json invalido" }, 400); }
    if (!data || typeof data !== "object" || !Array.isArray(data.meals) || !data.settings) return json({ erro: "formato invalido" }, 400);
    data.code = code;
    await store.setJSON(code, data, { metadata: { savedAt: Date.now() } });
    return json({ ok: true });
  }
  return json({ erro: "metodo nao permitido" }, 405);
};

export const config = { path: "/api/dieta" };
