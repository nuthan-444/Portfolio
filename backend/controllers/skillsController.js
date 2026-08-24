import SkillsDomain from '../models/Skills.js';

// GET /api/skills — public: fetch all skill domains ordered by `order` field
export const getSkills = async (req, res) => {
  try {
    const skills = await SkillsDomain.find().sort({ order: 1, createdAt: 1 });
    res.json(skills);
  } catch (err) {
    console.error('[Skills] getSkills error:', err.message);
    res.status(500).json({ message: 'Failed to fetch skills' });
  }
};

// POST /api/skills — admin only: create a new domain
export const createDomain = async (req, res) => {
  try {
    const { title, icon, items, order } = req.body;
    if (!title) return res.status(400).json({ message: 'Domain title is required' });
    const domain = await SkillsDomain.create({ title, icon, items, order });
    res.status(201).json(domain);
  } catch (err) {
    console.error('[Skills] createDomain error:', err.message);
    res.status(500).json({ message: 'Failed to create domain' });
  }
};

// PUT /api/skills/:id — admin only: update a domain (title, icon, items)
export const updateDomain = async (req, res) => {
  try {
    const { title, icon, items, order } = req.body;
    const domain = await SkillsDomain.findByIdAndUpdate(
      req.params.id,
      { $set: { title, icon, items, order } },
      { new: true, runValidators: true }
    );
    if (!domain) return res.status(404).json({ message: 'Domain not found' });
    res.json(domain);
  } catch (err) {
    console.error('[Skills] updateDomain error:', err.message);
    res.status(500).json({ message: 'Failed to update domain' });
  }
};

// DELETE /api/skills/:id — admin only: delete a domain
export const deleteDomain = async (req, res) => {
  try {
    const domain = await SkillsDomain.findByIdAndDelete(req.params.id);
    if (!domain) return res.status(404).json({ message: 'Domain not found' });
    res.json({ message: 'Domain deleted' });
  } catch (err) {
    console.error('[Skills] deleteDomain error:', err.message);
    res.status(500).json({ message: 'Failed to delete domain' });
  }
};
