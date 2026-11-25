/**
 * Seed script — populates initial skill domains in MongoDB.
 * Run once: node scripts/seedSkills.js
 */
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import SkillsDomain from '../models/Skills.js';

dotenv.config();

const SEED_SKILLS = [
  {
    title: 'AI & Machine Learning',
    icon: 'Sparkles',
    order: 0,
    items: ['LLM Fine-Tuning', 'Multi-Agent Systems', 'RAG Pipelines', 'Model Context Protocol (MCP)', 'PyTorch & LangChain', 'Vector DBs (Pinecone)'],
  },
  {
    title: 'Full-Stack Development',
    icon: 'Globe',
    order: 1,
    items: ['React.js & Next.js', 'Node.js & Express', 'REST & GraphQL APIs', 'TailwindCSS & Vanilla CSS', 'System Architecture', 'Redux & Context API'],
  },
  {
    title: 'Database & DevOps',
    icon: 'Database',
    order: 2,
    items: ['MongoDB & Mongoose', 'PostgreSQL & Prisma', 'Redis Caching', 'Cloudinary & S3', 'Docker & CI/CD', 'Vercel & Render Deployment'],
  },
];

const seed = async () => {
  await connectDB();
  const existing = await SkillsDomain.countDocuments();
  if (existing > 0) {
    console.log(`[Seed] ${existing} skill domain(s) already exist. Skipping.`);
    process.exit(0);
  }
  await SkillsDomain.insertMany(SEED_SKILLS);
  console.log('[Seed] ✅ Inserted', SEED_SKILLS.length, 'skill domains.');
  process.exit(0);
};

seed().catch((e) => {
  console.error('[Seed] Error:', e.message);
  process.exit(1);
});
