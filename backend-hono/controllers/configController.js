import SiteConfig from '../models/SiteConfig.js';

// GET /api/config  — public
export const getConfig = async (c) => {
  try {
    let config = await SiteConfig.findOne({ key: 'main' });
    if (!config) {
      config = await SiteConfig.create({ key: 'main' });
    }
    return c.json(config);
  } catch (err) {
    console.error('[Config] getConfig error:', err.message);
    return c.json({ message: 'Failed to fetch site config' }, 500);
  }
};

// PUT /api/config  — admin only
export const updateConfig = async (c) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { social, otherLinks, resumeUrl, ownerName, tagline } = body;

    const config = await SiteConfig.findOneAndUpdate(
      { key: 'main' },
      { $set: { social, otherLinks, resumeUrl, ownerName, tagline } },
      { upsert: true, new: true, runValidators: true }
    );

    return c.json({ message: 'Site config updated successfully', config });
  } catch (err) {
    console.error('[Config] updateConfig error:', err.message);
    return c.json({ message: 'Failed to update site config' }, 500);
  }
};
