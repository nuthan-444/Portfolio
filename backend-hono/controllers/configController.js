import { getDB } from '../config/db.js';

// Default fallback config when MongoDB is not connected
const defaultConfig = {
  key: 'main',
  social: {
    github: 'https://github.com/nuthanprasadkg',
    linkedin: '',
    twitter: '',
    email: 'forcodingstuffs@gmail.com',
  },
  otherLinks: [],
  resumeUrl: '',
  ownerName: 'Nuthan Prasad KG',
  tagline: 'Full-Stack Developer & AI/ML Engineer in India',
};

// GET /api/config  — public
export const getConfig = async (c) => {
  try {
    const db = await getDB(c);
    if (db) {
      const col = db.collection('siteconfigs');
      let config = await col.findOne({ key: 'main' });
      if (!config) {
        const now = new Date();
        const initial = {
          key: 'main',
          social: { github: '', linkedin: '', twitter: '', email: '' },
          otherLinks: [],
          resumeUrl: '',
          ownerName: 'Nuthan Prasad KG',
          tagline: 'Full-Stack Developer & AI/ML Engineer in India',
          createdAt: now,
          updatedAt: now,
        };
        const res = await col.insertOne(initial);
        config = { _id: res.insertedId, ...initial };
      }
      return c.json(config);
    }

    console.warn('[Config] MongoDB not connected — returning default config');
    return c.json(defaultConfig);
  } catch (err) {
    console.error('[Config] getConfig error:', err.message);
    return c.json(defaultConfig);
  }
};

// PUT /api/config  — admin only
export const updateConfig = async (c) => {
  const db = await getDB(c);
  if (!db) {
    return c.json({ message: 'Database not connected. Cannot update config.' }, 503);
  }

  try {
    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { social, otherLinks, resumeUrl, ownerName, tagline } = body;
    const now = new Date();
    const updates = { updatedAt: now };
    if (social !== undefined) updates.social = social;
    if (otherLinks !== undefined) updates.otherLinks = otherLinks;
    if (resumeUrl !== undefined) updates.resumeUrl = resumeUrl;
    if (ownerName !== undefined) updates.ownerName = ownerName;
    if (tagline !== undefined) updates.tagline = tagline;

    const config = await db.collection('siteconfigs').findOneAndUpdate(
      { key: 'main' },
      {
        $set: updates,
        $setOnInsert: { key: 'main', createdAt: now },
      },
      { upsert: true, returnDocument: 'after' }
    );

    return c.json({ message: 'Site config updated successfully', config });
  } catch (err) {
    console.error('[Config] updateConfig error:', err.message);
    return c.json({ message: 'Failed to update site config' }, 500);
  }
};
