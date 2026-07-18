// POST /api/delete — remove file from R2 and metadata from KV
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { id } = await request.json();
    if (!id) return json({ success: false, message: 'Missing item ID' }, 400);

    const existing = await env.FARM_DATA.get('media');
    const media    = JSON.parse(existing || '[]');
    const item     = media.find(m => m.id === id);

    if (!item) return json({ success: false, message: 'Item not found' }, 404);

    // Delete file from R2
    const r2Key = item.url.replace('/files/', '');
    try { await env.FARM_FILES.delete(r2Key); } catch (_) {}

    // Remove from KV list
    const updated = media.filter(m => m.id !== id);
    await env.FARM_DATA.put('media', JSON.stringify(updated));

    return json({ success: true, message: 'Deleted successfully' });
  } catch (e) {
    return json({ success: false, message: `Error: ${e.message}` }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
