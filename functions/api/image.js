export async function onRequestGet({ env }) {
  const src = await env.HEATMAP_KV.get('image');
  return Response.json({ src: src ?? null });
}

export async function onRequestPost({ env, request }) {
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { src } = body;
  if (!src || typeof src !== 'string') {
    return Response.json({ error: 'Missing src' }, { status: 400 });
  }
  // Store image, then wipe all sessions so new image = clean slate
  await env.HEATMAP_KV.put('image', src);
  const list = await env.HEATMAP_KV.list({ prefix: 'session:' });
  await Promise.all(list.keys.map(k => env.HEATMAP_KV.delete(k.name)));
  return Response.json({ ok: true });
}

export async function onRequestDelete({ env }) {
  await env.HEATMAP_KV.delete('image');
  const list = await env.HEATMAP_KV.list({ prefix: 'session:' });
  await Promise.all(list.keys.map(k => env.HEATMAP_KV.delete(k.name)));
  return Response.json({ ok: true });
}
