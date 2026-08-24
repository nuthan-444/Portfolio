import mongoose from 'mongoose';

const skillsDomainSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },  // e.g. "AI & Machine Learning"
    icon: { type: String, default: 'Cpu' },   // lucide icon name
    order: { type: Number, default: 0 },
    items: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.SkillsDomain || mongoose.model('SkillsDomain', skillsDomainSchema);
