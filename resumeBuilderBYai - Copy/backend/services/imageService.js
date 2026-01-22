const fetch = require('node-fetch');

/**
 * Search images using Unsplash (if configured) or return a helpful message.
 * Returns array of { title, url, thumbnail }
 */
async function searchImages(query, perPage = 10) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return { success: false, message: 'UNSPLASH_ACCESS_KEY not configured', results: [] };
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  if (!res.ok) {
    return { success: false, message: `Unsplash error ${res.status}`, results: [] };
  }
  const data = await res.json();
  const results = (data.results || []).map(r => ({
    title: r.alt_description || r.description || r.id,
    url: r.urls.full,
    thumbnail: r.urls.thumb,
    source: 'unsplash',
  }));
  return { success: true, results };
}

module.exports = { searchImages };
