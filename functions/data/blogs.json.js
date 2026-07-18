// GET /data/blogs.json — serve blogs from Cloudflare KV
export async function onRequestGet(context) {
  const data = await context.env.FARM_DATA.get('blogs');
  return new Response(data || '[]', {
    headers: { 'Content-Type': 'application/json' },
  });
}
