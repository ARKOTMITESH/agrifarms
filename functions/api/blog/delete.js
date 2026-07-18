// POST /api/blog/delete — remove blog post from KV
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { id } = await request.json();
    if (!id) return json({ success: false, message: 'Missing blog ID' }, 400);

    const existing = await env.FARM_DATA.get('blogs');
    const blogs    = JSON.parse(existing || '[]');
    const updated  = blogs.filter(b => String(b.id) !== String(id));
    await env.FARM_DATA.put('blogs', JSON.stringify(updated));

    return json({ success: true, message: 'Blog post deleted' });
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
