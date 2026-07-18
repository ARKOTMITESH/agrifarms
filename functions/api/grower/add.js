// POST /api/grower/add — register a new grower in KV
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { name, location, acres = '', phone = '', crop = '', details = '' } = data;

    if (!name || !location) {
      return json({ success: false, message: 'Missing required fields (name, location)' }, 400);
    }

    const existing = await env.FARM_DATA.get('growers');
    const growers  = JSON.parse(existing || '[]');

    const newGrower = {
      id:       `grower_${Date.now()}`,
      name, location, acres, phone, crop, details,
    };
    growers.push(newGrower);
    await env.FARM_DATA.put('growers', JSON.stringify(growers));

    return json({ success: true, grower: newGrower });
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
