import { getDB, toObjectId } from '../config/db.js';
import { uploadFileToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

let memRequests = [];

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'image/svg+xml', 'application/pdf',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/* ── Public: submit a request ──────────────────────────────── */
export const createWebsiteRequest = async (c) => {
  let fields = {};
  let rawFiles = [];

  try {
    const body = await c.req.parseBody({ all: true });
    fields = body;
    const f = body['files'];
    rawFiles = f ? (Array.isArray(f) ? f : [f]) : [];
  } catch {
    return c.json({ message: 'Failed to parse form data.' }, 400);
  }

  const {
    fullName, email, phone, company,
    websiteType, projectDescription, features,
    hasExistingWebsite, existingWebsiteUrl, referenceUrl,
    budget, timeline, additionalInfo, contactMethod,
  } = fields;

  if (!fullName || !email || !websiteType || !projectDescription || !budget) {
    return c.json({ message: 'Please fill all required fields.' }, 400);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ message: 'Please provide a valid email address.' }, 400);
  }

  const cloudName = c.env?.CLOUDINARY_CLOUD_NAME;
  const cloudKey = c.env?.CLOUDINARY_API_KEY;
  const cloudSecret = c.env?.CLOUDINARY_API_SECRET;

  const uploadedFiles = [];
  for (const file of rawFiles) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (!ALLOWED_MIME_TYPES.has(file.type)) continue;
    if (file.size > MAX_FILE_SIZE) continue;

    try {
      const buffer = await file.arrayBuffer();
      const result = await uploadFileToCloudinary(
        Buffer.from(buffer),
        file.name,
        'portfolio_request_files',
        cloudName,
        cloudKey,
        cloudSecret
      );
      uploadedFiles.push(result);
    } catch (uploadErr) {
      console.error('File upload failed:', uploadErr.message);
    }
  }

  const data = {
    fullName: String(fullName).trim(),
    email: String(email).trim(),
    phone: phone ? String(phone).trim() : '',
    company: company ? String(company).trim() : '',
    websiteType,
    projectDescription,
    features: Array.isArray(features) ? features : features ? [features] : [],
    hasExistingWebsite: hasExistingWebsite === 'true' || hasExistingWebsite === true,
    existingWebsiteUrl: existingWebsiteUrl ? String(existingWebsiteUrl).trim() : '',
    referenceUrl: referenceUrl ? String(referenceUrl).trim() : '',
    uploadedFiles,
    budget,
    timeline: timeline || '',
    additionalInfo: additionalInfo || '',
    contactMethod: contactMethod || 'Email',
    isRead: false,
    createdAt: new Date(),
  };

  try {
    let saved;
    const db = await getDB(c);
    if (db) {
      const res = await db.collection('websiterequests').insertOne(data);
      saved = { _id: res.insertedId, ...data };
    } else {
      saved = { _id: `req_${Date.now()}`, ...data };
      memRequests.unshift(saved);
    }
    return c.json({ success: true, message: 'Request submitted successfully!', data: saved }, 201);
  } catch (err) {
    console.error('WebsiteRequest create error:', err);
    return c.json({ message: 'Server error. Please try again.' }, 500);
  }
};

/* ── Admin: get all requests ───────────────────────────────── */
export const getWebsiteRequests = async (c) => {
  try {
    const db = await getDB(c);
    if (db) {
      const col = db.collection('websiterequests');
      const requests = await col.find().sort({ createdAt: -1 }).toArray();
      const unreadCount = await col.countDocuments({ isRead: false });
      return c.json({ requests, unreadCount });
    }
    const unreadCount = memRequests.filter((r) => !r.isRead).length;
    return c.json({ requests: memRequests, unreadCount });
  } catch (err) {
    console.error('WebsiteRequest fetch error:', err);
    return c.json({ message: 'Failed to fetch requests.' }, 500);
  }
};

/* ── Admin: toggle read ────────────────────────────────────── */
export const toggleWebsiteRequestRead = async (c) => {
  const { id } = c.req.param();
  try {
    const db = await getDB(c);
    if (db) {
      const oid = toObjectId(id);
      if (!oid) return c.json({ message: 'Request not found.' }, 404);
      const col = db.collection('websiterequests');
      const doc = await col.findOne({ _id: oid });
      if (!doc) return c.json({ message: 'Request not found.' }, 404);

      const updated = await col.findOneAndUpdate(
        { _id: oid },
        { $set: { isRead: !doc.isRead } },
        { returnDocument: 'after' }
      );
      const unreadCount = await col.countDocuments({ isRead: false });
      return c.json({ request: updated, unreadCount });
    }
    const idx = memRequests.findIndex((r) => r._id === id);
    if (idx === -1) return c.json({ message: 'Request not found.' }, 404);
    memRequests[idx].isRead = !memRequests[idx].isRead;
    const unreadCount = memRequests.filter((r) => !r.isRead).length;
    return c.json({ request: memRequests[idx], unreadCount });
  } catch (err) {
    console.error('WebsiteRequest toggle read error:', err);
    return c.json({ message: 'Failed to update request.' }, 500);
  }
};

/* ── Admin: delete + its Cloudinary files ─────────────────── */
export const deleteWebsiteRequest = async (c) => {
  const { id } = c.req.param();
  const cloudName = c.env?.CLOUDINARY_CLOUD_NAME;
  const cloudKey = c.env?.CLOUDINARY_API_KEY;
  const cloudSecret = c.env?.CLOUDINARY_API_SECRET;

  try {
    let uploadedFiles = [];
    const db = await getDB(c);

    if (db) {
      const oid = toObjectId(id);
      if (!oid) return c.json({ message: 'Request not found.' }, 404);
      const col = db.collection('websiterequests');
      const doc = await col.findOne({ _id: oid });
      if (!doc) return c.json({ message: 'Request not found.' }, 404);
      uploadedFiles = doc.uploadedFiles || [];
      await col.deleteOne({ _id: oid });
      const unreadCount = await col.countDocuments({ isRead: false });

      for (const file of uploadedFiles) {
        deleteFromCloudinary(file.publicId, file.resourceType || 'raw', cloudName, cloudKey, cloudSecret).catch(() => {});
      }

      return c.json({ message: 'Deleted.', unreadCount });
    }

    const idx = memRequests.findIndex((r) => r._id === id);
    if (idx !== -1) {
      uploadedFiles = memRequests[idx].uploadedFiles || [];
      memRequests.splice(idx, 1);
      for (const file of uploadedFiles) {
        deleteFromCloudinary(file.publicId, file.resourceType || 'raw', cloudName, cloudKey, cloudSecret).catch(() => {});
      }
    }
    const unreadCount = memRequests.filter((r) => !r.isRead).length;
    return c.json({ message: 'Deleted.', unreadCount });
  } catch (err) {
    console.error('WebsiteRequest delete error:', err);
    return c.json({ message: 'Failed to delete request.' }, 500);
  }
};
