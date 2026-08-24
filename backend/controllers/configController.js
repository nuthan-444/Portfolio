import SiteConfig from '../models/SiteConfig.js';

// GET /api/config  — public, returns current site config
export const getConfig = async (req, res) => {
  try {
    let config = await SiteConfig.findOne({ key: 'main' });
    if (!config) {
      // Create default config on first access
      config = await SiteConfig.create({ key: 'main' });
    }
    res.json(config);
  } catch (err) {
    console.error('[Config] getConfig error:', err.message);
    res.status(500).json({ message: 'Failed to fetch site config' });
  }
};

// PUT /api/config  — admin only, updates social links, otherLinks, etc.
export const updateConfig = async (req, res) => {
  try {
    const { social, otherLinks, resumeUrl, ownerName, tagline } = req.body;

    const config = await SiteConfig.findOneAndUpdate(
      { key: 'main' },
      { $set: { social, otherLinks, resumeUrl, ownerName, tagline } },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ message: 'Site config updated successfully', config });
  } catch (err) {
    console.error('[Config] updateConfig error:', err.message);
    res.status(500).json({ message: 'Failed to update site config' });
  }
};

