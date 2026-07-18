// POST /api/upload — upload file to R2, save metadata to KV
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const title       = formData.get('title');
    const mediaType   = formData.get('type');
    const description = formData.get('description') || '';
    const category    = formData.get('category') || 'all';
    const growerId    = formData.get('growerId') || '';
    const file        = formData.get('file');

    if (!title || !mediaType || !file) {
      return json({ success: false, message: 'Missing required fields (title, type, file)' }, 400);
    }

    // Build safe filename
    const timestamp = Date.now();
    const rawName   = file.name || 'upload';
    const safeName  = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename  = `${timestamp}_${safeName}`;
    const folderMap = { image: 'images', video: 'videos', pdf: 'pdfs' };
    const folder    = folderMap[mediaType] || 'images';
    const r2Key     = `uploads/${folder}/${filename}`;

    // Upload to R2
    await env.FARM_FILES.put(r2Key, file.stream(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    });

    // Public URL served via /files/ Pages Function
    const fileUrl = `/files/${r2Key}`;

    // Update media list in KV
    const existing = await env.FARM_DATA.get('media');
    const media    = JSON.parse(existing || '[]');
    const newItem  = {
      id: String(timestamp),
      title, type: mediaType, description, category,
      growerId, filename,
      url: fileUrl,
      date: new Date().toISOString().slice(0, 10),
    };
    media.push(newItem);
    await env.FARM_DATA.put('media', JSON.stringify(media));

    return json({ success: true, item: newItem });
  } catch (e) {
    return json({ success: false, message: `Upload error: ${e.message}` }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
