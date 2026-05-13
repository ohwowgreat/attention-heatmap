function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function onRequestGet({ env }) {
  const list = await env.HEATMAP_KV.list({ prefix: 'session:' });
  const sessions = (
    await Promise.all(list.keys.map(k => env.HEATMAP_KV.get(k.name, 'json')))
  ).filter(Boolean);
  sessions.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  return Response.json({ sessions });
}

export async function onRequestPost({ env, request }) {
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { name, clicks, reason } = body;
  if (!Array.isArray(clicks) || clicks.length < 1) {
    return Response.json({ error: 'At least 1 click required' }, { status: 400 });
  }
  const session = {
    name: name ? String(name).slice(0, 80) : null,
    clicks: clicks.map(c => ({ nx: +c.nx, ny: +c.ny, order: +c.order })),
    reason: reason ? String(reason).slice(0, 500) : null,
    ts: Date.now(),
  };
  await env.HEATMAP_KV.put(`session:${genId()}`, JSON.stringify(session));
  return Response.json({ ok: true });
}

export async function onRequestDelete({ env }) {
  const list = await env.HEATMAP_KV.list({ prefix: 'session:' });
  await Promise.all(list.keys.map(k => env.HEATMAP_KV.delete(k.name)));
  return Response.json({ ok: true });
}
