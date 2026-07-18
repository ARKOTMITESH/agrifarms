// GET /files/* — serve uploaded files from Cloudflare R2
export async function onRequestGet(context) {
  const { params, env } = context;
  // params.path is an array of path segments after /files/
  const key = Array.isArray(params.path) ? params.path.join('/') : params.path;

  try {
    const object = await env.FARM_FILES.get(key);
    if (!object) {
      return new Response('File not found', { status: 404 });
    }

    const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (e) {
    return new Response(`Error fetching file: ${e.message}`, { status: 500 });
  }
}
