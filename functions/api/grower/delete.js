// POST /api/grower/delete — remove grower from KV, unlink their media
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { id } = await request.json();
    if (!id) return json({ success: false, message: 'Missing grower ID' }, 400);

    // Remove from growers list
    const gExisting = await env.FARM_DATA.get('growers');
    const growers   = JSON.parse(gExisting || '[]');
    const updated   = growers.filter(g => g.id !== id);
    await env.FARM_DATA.put('growers', JSON.stringify(updated));

    // Unlink associated media (set growerId to '')
    const mExisting = await env.FARM_DATA.get('media');
    const media     = JSON.parse(mExisting || '[]');
    const updMedia  = media.map(m => m.growerId === id ? { ...m, growerId: '' } : m);
    await env.FARM_DATA.put('media', JSON.stringify(updMedia));

    return json({ success: true, message: 'Grower deleted successfully' });
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
