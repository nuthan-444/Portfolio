import { getDB, toObjectId } from '../config/db.js';

// Fallback skills when DB is offline
const defaultSkills = [
  { _id: 'sk_1', title: 'AI & Machine Learning', icon: 'Cpu', order: 1, items: ['Python', 'PyTorch', 'TensorFlow', 'LangChain', 'RAG', 'Vector DBs'] },
  { _id: 'sk_2', title: 'Full-Stack Web Dev', icon: 'Globe', order: 2, items: ['React', 'Next.js', 'Node.js', 'TypeScript', 'TailwindCSS', 'MongoDB'] },
  { _id: 'sk_3', title: 'DevOps & Cloud', icon: 'Cloud', order: 3, items: ['Docker', 'Cloudflare Workers', 'Vercel', 'AWS', 'CI/CD'] },
];

// GET /api/skills — public
export const getSkills = async (c) => {
  try {
    const db = await getDB(c);
    if (db) {
      const skills = await db
        .collection('skillsdomains')
        .find()
        .sort({ order: 1, createdAt: 1 })
        .toArray();
      return c.json(skills);
    }
    console.warn('[Skills] MongoDB not connected — returning default skills');
    return c.json(defaultSkills);
  } catch (err) {
    console.error('[Skills] getSkills error:', err.message);
    return c.json(defaultSkills);
  }
};

// POST /api/skills — admin only
export const createDomain = async (c) => {
  const db = await getDB(c);
  if (!db) {
    return c.json({ message: 'Database not connected.' }, 503);
  }
  try {
    let body;
    try { body = await c.req.json(); } catch { return c.json({ message: 'Invalid JSON body' }, 400); }
    const { title, icon, items, order } = body;
    if (!title) return c.json({ message: 'Domain title is required' }, 400);

    const now = new Date();
    const doc = {
      title,
      icon: icon || 'Cpu',
      items: Array.isArray(items) ? items : [],
      order: Number(order) || 0,
      createdAt: now,
      updatedAt: now,
    };
    const res = await db.collection('skillsdomains').insertOne(doc);
    return c.json({ _id: res.insertedId, ...doc }, 201);
  } catch (err) {
    console.error('[Skills] createDomain error:', err.message);
    return c.json({ message: 'Failed to create domain' }, 500);
  }
};

// PUT /api/skills/:id — admin only
export const updateDomain = async (c) => {
  const db = await getDB(c);
  if (!db) {
    return c.json({ message: 'Database not connected.' }, 503);
  }
  try {
    const oid = toObjectId(c.req.param('id'));
    if (!oid) return c.json({ message: 'Domain not found' }, 404);

    let body;
    try { body = await c.req.json(); } catch { return c.json({ message: 'Invalid JSON body' }, 400); }
    const { title, icon, items, order } = body;
    const updates = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (icon !== undefined) updates.icon = icon;
    if (items !== undefined) updates.items = items;
    if (order !== undefined) updates.order = Number(order);

    const domain = await db
      .collection('skillsdomains')
      .findOneAndUpdate(
        { _id: oid },
        { $set: updates },
        { returnDocument: 'after' }
      );
    if (!domain) return c.json({ message: 'Domain not found' }, 404);
    return c.json(domain);
  } catch (err) {
    console.error('[Skills] updateDomain error:', err.message);
    return c.json({ message: 'Failed to update domain' }, 500);
  }
};

// DELETE /api/skills/:id — admin only
export const deleteDomain = async (c) => {
  const db = await getDB(c);
  if (!db) {
    return c.json({ message: 'Database not connected.' }, 503);
  }
  try {
    const oid = toObjectId(c.req.param('id'));
    if (!oid) return c.json({ message: 'Domain not found' }, 404);

    const domain = await db.collection('skillsdomains').findOneAndDelete({ _id: oid });
    if (!domain) return c.json({ message: 'Domain not found' }, 404);
    return c.json({ message: 'Domain deleted' });
  } catch (err) {
    console.error('[Skills] deleteDomain error:', err.message);
    return c.json({ message: 'Failed to delete domain' }, 500);
  }
};
