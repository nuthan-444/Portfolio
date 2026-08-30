import mongoose from 'mongoose';

const uploadedFileSchema = new mongoose.Schema({
  url:          { type: String, required: true },
  publicId:     { type: String, required: true },
  originalName: { type: String, required: true },
  resourceType: { type: String, default: 'raw' }, // 'image' | 'raw'
}, { _id: false });

const websiteRequestSchema = new mongoose.Schema({
  // Personal Info
  fullName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, trim: true },
  phone:       { type: String, trim: true, default: '' },
  company:     { type: String, trim: true, default: '' },

  // Website Requirements
  websiteType:        { type: String, required: true },
  projectDescription: { type: String, required: true },
  features:           { type: [String], default: [] },

  // Design & References
  hasExistingWebsite: { type: Boolean, default: false },
  existingWebsiteUrl: { type: String, trim: true, default: '' },
  referenceUrl:       { type: String, trim: true, default: '' },
  uploadedFiles:      { type: [uploadedFileSchema], default: [] }, // Cloudinary files

  // Budget & Timeline
  budget:   { type: String, required: true },
  timeline: { type: String, default: '' },

  // Additional
  additionalInfo: { type: String, default: '' },
  contactMethod:  { type: String, default: 'Email' },

  // Admin
  isRead:    { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.WebsiteRequest ||
  mongoose.model('WebsiteRequest', websiteRequestSchema);
