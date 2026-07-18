// POST /api/blog/add — add a blog post to KV
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { title, content, category = 'General', author = 'Admin', image = '' } = data;

    if (!title || !content) {
      return json({ success: false, message: 'Missing required fields (title, content)' }, 400);
    }

    const existing = await env.FARM_DATA.get('blogs');
    const blogs    = JSON.parse(existing || '[]');

    const newPost = {
      id:       Date.now(),
      title, content, category, author, image,
      date:     new Date().toISOString().slice(0, 10),
    };
    blogs.push(newPost);
    await env.FARM_DATA.put('blogs', JSON.stringify(blogs));

    return json({ success: true, post: newPost });
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
