import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['All', 'Web Dev', 'AI/ML'],
    default: 'Web Dev',
  },
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String, default: '' },
    },
  ],
  projectLink: {
    type: String,
    default: '',
  },
  githubLink: {
    type: String,
    default: '',
  },
  techStack: {
    type: [String],
    default: [],
  },
  order: {
    type: Number,
    default: 0,
  },
  projectDate: {
    type: Date,
  },
  isHardCoded: {
    type: Boolean,
    default: false,
  },
  count: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
