import { getStore } from "@netlify/blobs";
import webpush from "web-push";

// Roda a cada 5 minutos (horário UTC no Netlify) e manda os avisos de água e de refeição
// que chegaram na hora, no fuso de cada aparelho. Não repete aviso já mandado nem avisa o que já foi marcado.
const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const JANELA = 15; // minutos de tolerância se o agendamento atrasar

export function agora(tz, d = new Date()) {
  const p = {};
  new Intl.DateTimeFormat("en-CA", { timeZone: tz || "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" })
    .formatToParts(d).forEach((x) => { p[x.type] = x.value; });
  return { date: `${p.year}-${p.month}-${p.day}`, min: +p.hour * 60 + +p.minute, wd: WD[p.weekday] };
}
const tmin = (t) => { const [h, m] = String(t).split(":"); return +h * 60 + +m; };

// escolhe os avisos que devem sair agora para um aparelho
export function escolher(rec, now) {
  const plan = rec.plan, sent = (rec.sent && rec.sent[now.date]) || {}, out = [];
  const done = plan.done && plan.done.date === now.date ? plan.done : { meals: [], water: [] };
  const due = (t) => { const m = tmin(t); return now.min >= m && now.min < m + JANELA; };
  (plan.water || []).forEach((w) => {
    if (due(w.t) && !sent["w" + w.id] && !(done.water || []).includes(w.id)) out.push({ id: "w" + w.id, title: "💧 Hora de beber água", body: `Um copo de ${plan.cup || 250} ml` });
  });
  ((plan.week && plan.week[now.wd]) || []).forEach((m) => {
    if (due(m.t) && !sent["m" + m.id] && !(done.meals || []).includes(m.id)) out.push({ id: "m" + m.id, title: `🍽️ Hora do ${String(m.n || "lanche").toLowerCase()}`, body: m.x || "Abra o app para ver o que comer" });
  });
  return out;
}

export default async () => {
  const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) { console.log("Lembretes: faltam as chaves VAPID nas variáveis do Netlify"); return; }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "https://dieta-da-joice-app.netlify.app", pub, priv);
  const store = getStore({ name: "lembretes", consistency: "strong" });
  const { blobs } = await store.list();
  for (const { key } of blobs) {
    const rec = await store.get(key, { type: "json" });
    if (!rec || !rec.plan) continue;
    const now = agora(rec.plan.tz), avisos = escolher(rec, now);
    if (!avisos.length) continue;
    let morto = false;
    for (const a of avisos) {
      try { await webpush.sendNotification(rec.sub, JSON.stringify({ title: a.title, body: a.body, tag: a.id })); }
      catch (e) { if (e && (e.statusCode === 404 || e.statusCode === 410)) { morto = true; break; } console.log("falha ao avisar", e && e.statusCode); }
    }
    if (morto) { await store.delete(key); continue; }
    rec.sent = { [now.date]: Object.assign({}, rec.sent && rec.sent[now.date], ...avisos.map((a) => ({ [a.id]: 1 }))) };
    await store.setJSON(key, rec);
  }
};

export const config = { schedule: "*/5 * * * *" };
