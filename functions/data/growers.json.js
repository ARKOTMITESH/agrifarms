// GET /data/growers.json — serve growers from Cloudflare KV
export async function onRequestGet(context) {
  const data = await context.env.FARM_DATA.get('growers');
  return new Response(data || '[]', {
    headers: { 'Content-Type': 'application/json' },
  });
}
