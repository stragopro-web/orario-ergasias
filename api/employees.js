// Same-origin proxy: only the employee directory is exposed to the form.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { url } = require('../directory-config.json');
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url || '')) {
    return res.status(503).json({ error: 'Directory not configured' });
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    if (!response.ok) throw new Error('Upstream unavailable');
    const data = await response.json();
    if (!Array.isArray(data.names) || data.names.some(name => typeof name !== 'string' || name.length > 120)) {
      throw new Error('Invalid directory response');
    }
    const names = [...new Set(data.names.map(name => name.trim()).filter(Boolean))];
    return res.status(200).json({ names });
  } catch {
    return res.status(502).json({ error: 'Directory unavailable' });
  } finally {
    clearTimeout(timer);
  }
};
