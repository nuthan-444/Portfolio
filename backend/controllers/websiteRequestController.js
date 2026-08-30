import WebsiteRequest from '../models/WebsiteRequest.js';
import { uploadFileToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

let memRequests = [];

/* ── Public: submit a request (with optional file uploads) ── */
export const createWebsiteRequest = async (req, res) => {
  const {
    fullName, email, phone, company,
    websiteType, projectDescription, features,
    hasExistingWebsite, existingWebsiteUrl, referenceUrl,
    budget, timeline, additionalInfo, contactMethod,
  } = req.body;

  if (!fullName || !email || !websiteType || !projectDescription || !budget) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  try {
    // Upload each attached file to Cloudinary
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadFileToCloudinary(
            file.buffer,
            file.originalname,
            'portfolio_request_files'
          );
          uploadedFiles.push(result);
        } catch (uploadErr) {
          console.error('File upload failed:', uploadErr.message);
          // Continue — skip failed uploads rather than rejecting whole request
        }
      }
    }

    const data = {
      fullName, email,
      phone: phone || '',
      company: company || '',
      websiteType,
      projectDescription,
      features: Array.isArray(features) ? features : features ? [features] : [],
      hasExistingWebsite: hasExistingWebsite === 'true' || hasExistingWebsite === true,
      existingWebsiteUrl: existingWebsiteUrl || '',
      referenceUrl: referenceUrl || '',
      uploadedFiles,
      budget,
      timeline: timeline || '',
      additionalInfo: additionalInfo || '',
      contactMethod: contactMethod || 'Email',
      isRead: false,
      createdAt: new Date(),
    };

    let saved;
    if (WebsiteRequest.db && WebsiteRequest.db.readyState === 1) {
      saved = await WebsiteRequest.create(data);
    } else {
      saved = { _id: `req_${Date.now()}`, ...data };
      memRequests.unshift(saved);
    }

    res.status(201).json({ success: true, message: 'Request submitted successfully!', data: saved });
  } catch (err) {
    console.error('WebsiteRequest create error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

/* ── Admin: get all requests ──────────────────────────────── */
export const getWebsiteRequests = async (req, res) => {
  try {
    if (WebsiteRequest.db && WebsiteRequest.db.readyState === 1) {
      const requests = await WebsiteRequest.find().sort({ createdAt: -1 });
      const unreadCount = await WebsiteRequest.countDocuments({ isRead: false });
      return res.json({ requests, unreadCount });
    }
    const unreadCount = memRequests.filter((r) => !r.isRead).length;
    res.json({ requests: memRequests, unreadCount });
  } catch (err) {
    console.error('WebsiteRequest fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch requests.' });
  }
};

/* ── Admin: toggle read ───────────────────────────────────── */
export const toggleWebsiteRequestRead = async (req, res) => {
  const { id } = req.params;
  try {
    if (WebsiteRequest.db && WebsiteRequest.db.readyState === 1) {
      const doc = await WebsiteRequest.findById(id);
      if (!doc) return res.status(404).json({ message: 'Request not found.' });
      doc.isRead = !doc.isRead;
      await doc.save();
      const unreadCount = await WebsiteRequest.countDocuments({ isRead: false });
      return res.json({ request: doc, unreadCount });
    }
    const idx = memRequests.findIndex((r) => r._id === id);
    if (idx === -1) return res.status(404).json({ message: 'Request not found.' });
    memRequests[idx].isRead = !memRequests[idx].isRead;
    const unreadCount = memRequests.filter((r) => !r.isRead).length;
    res.json({ request: memRequests[idx], unreadCount });
  } catch (err) {
    console.error('WebsiteRequest toggle read error:', err);
    res.status(500).json({ message: 'Failed to update request.' });
  }
};

/* ── Admin: delete request + its Cloudinary files ────────── */
export const deleteWebsiteRequest = async (req, res) => {
  const { id } = req.params;
  try {
    let uploadedFiles = [];

    if (WebsiteRequest.db && WebsiteRequest.db.readyState === 1) {
      const doc = await WebsiteRequest.findById(id);
      if (!doc) return res.status(404).json({ message: 'Request not found.' });
      uploadedFiles = doc.uploadedFiles || [];
      await WebsiteRequest.findByIdAndDelete(id);
      const unreadCount = await WebsiteRequest.countDocuments({ isRead: false });

      // Delete all associated Cloudinary files in background
      for (const file of uploadedFiles) {
        deleteFromCloudinary(file.publicId, file.resourceType || 'raw').catch(() => {});
      }

      return res.json({ message: 'Deleted.', unreadCount });
    }

    // In-memory fallback
    const idx = memRequests.findIndex((r) => r._id === id);
    if (idx !== -1) {
      uploadedFiles = memRequests[idx].uploadedFiles || [];
      memRequests.splice(idx, 1);
      for (const file of uploadedFiles) {
        deleteFromCloudinary(file.publicId, file.resourceType || 'raw').catch(() => {});
      }
    }
    const unreadCount = memRequests.filter((r) => !r.isRead).length;
    res.json({ message: 'Deleted.', unreadCount });
  } catch (err) {
    console.error('WebsiteRequest delete error:', err);
    res.status(500).json({ message: 'Failed to delete request.' });
  }
};
