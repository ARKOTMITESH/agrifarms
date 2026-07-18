// GET /data/media.json — serve media list from Cloudflare KV
export async function onRequestGet(context) {
  const data = await context.env.FARM_DATA.get('media');
  return new Response(data || '[]', {
    headers: { 'Content-Type': 'application/json' },
  });
}
