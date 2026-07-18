// POST /api/login — verify passcode
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    if (body.passcode === 'mahima2026') {
      return json({ success: true, token: 'mock-token-mahima-2026' });
    }
    return json({ success: false, message: 'Invalid Passcode' }, 401);
  } catch (e) {
    return json({ success: false, message: 'Bad request' }, 400);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
