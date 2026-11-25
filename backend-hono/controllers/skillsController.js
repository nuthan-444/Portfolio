import SkillsDomain from '../models/Skills.js';

// GET /api/skills — public
export const getSkills = async (c) => {
  try {
    const skills = await SkillsDomain.find().sort({ order: 1, createdAt: 1 });
    return c.json(skills);
  } catch (err) {
    console.error('[Skills] getSkills error:', err.message);
    return c.json({ message: 'Failed to fetch skills' }, 500);
  }
};

// POST /api/skills — admin only
export const createDomain = async (c) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { title, icon, items, order } = body;
    if (!title) return c.json({ message: 'Domain title is required' }, 400);
    const domain = await SkillsDomain.create({ title, icon, items, order });
    return c.json(domain, 201);
  } catch (err) {
    console.error('[Skills] createDomain error:', err.message);
    return c.json({ message: 'Failed to create domain' }, 500);
  }
};

// PUT /api/skills/:id — admin only
export const updateDomain = async (c) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { title, icon, items, order } = body;
    const domain = await SkillsDomain.findByIdAndUpdate(
      c.req.param('id'),
      { $set: { title, icon, items, order } },
      { new: true, runValidators: true }
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
  try {
    const domain = await SkillsDomain.findByIdAndDelete(c.req.param('id'));
    if (!domain) return c.json({ message: 'Domain not found' }, 404);
    return c.json({ message: 'Domain deleted' });
  } catch (err) {
    console.error('[Skills] deleteDomain error:', err.message);
    return c.json({ message: 'Failed to delete domain' }, 500);
  }
};
