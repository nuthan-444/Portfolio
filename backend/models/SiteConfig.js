import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'main',
      unique: true,
    },
    social: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    resumeUrl: { type: String, default: '' },
    ownerName: { type: String, default: 'Nuthan Prasad KG' },
    tagline: { type: String, default: 'Full-Stack Developer & AI/ML Engineer in India' },
  },
  { timestamps: true }
);

export default mongoose.models.SiteConfig || mongoose.model('SiteConfig', siteConfigSchema);
