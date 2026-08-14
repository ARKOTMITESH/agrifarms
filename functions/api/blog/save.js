// POST /api/blog/save — save (add/update) a blog post in KV
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { id, title, content, category = 'General', author = 'Admin', image = '', readTime = '5 min', excerpt = '', date } = data;

    if (!title || !content) {
      return json({ success: false, message: 'Missing required fields (title, content)' }, 400);
    }

    const existing = await env.FARM_DATA.get('blogs');
    const blogs    = JSON.parse(existing || '[]');

    let newPost;
    if (id) {
      // Update existing post
      const index = blogs.findIndex(b => String(b.id) === String(id));
      if (index !== -1) {
        blogs[index] = {
          ...blogs[index],
          title,
          content,
          category,
          author,
          image,
          readTime,
          excerpt,
          date: date || blogs[index].date
        };
        newPost = blogs[index];
      } else {
        // If ID provided but not found, create new with this ID
        newPost = {
          id: id,
          title, content, category, author, image, readTime, excerpt,
          date: date || new Date().toISOString().slice(0, 10),
        };
        blogs.push(newPost);
      }
    } else {
      // Create new post
      newPost = {
        id:       Date.now(),
        title, content, category, author, image, readTime, excerpt,
        date:     date || new Date().toISOString().slice(0, 10),
      };
      blogs.push(newPost);
    }

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
