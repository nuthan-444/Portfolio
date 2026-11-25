import { getDB, toObjectId } from '../config/db.js';
import { sendContactNotificationEmail } from '../utils/mailer.js';

let memoryMessages = [
  {
    _id: 'msg_101',
    name: 'Sarah Connor',
    email: 'sarah.c@techcorp.io',
    message: 'Hey Nuthan! We loved your NexusAI agent orchestrator project and would love to discuss a potential senior AI engineer collaboration with our team.',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'msg_102',
    name: 'Alex Mercer',
    email: 'alex@innovatelabs.ai',
    message: 'Impressive portfolio! Are you available for contract work building custom RAG pipelines or Webhooks integrations?',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
];

export const createMessage = async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: 'Invalid JSON body' }, 400);
  }

  const { name, email, message } = body;

  if (!name || !email || !message) {
    return c.json({ message: 'Name, email, and message are required fields.' }, 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ message: 'Please provide a valid email address.' }, 400);
  }

  try {
    let newMessage;
    const createdAt = new Date();
    const db = await getDB(c);

    if (db) {
      const doc = {
        name: name.trim(),
        email: email.trim(),
        message,
        isRead: false,
        createdAt,
      };
      const result = await db.collection('messages').insertOne(doc);
      newMessage = { _id: result.insertedId, ...doc };
    } else {
      newMessage = {
        _id: `msg_${Date.now()}`,
        name,
        email,
        message,
        isRead: false,
        createdAt: createdAt.toISOString(),
      };
      memoryMessages.unshift(newMessage);
    }

    const env = {
      ADMIN_EMAIL: c.env?.ADMIN_EMAIL,
      SMTP_FROM_EMAIL: c.env?.SMTP_FROM_EMAIL,
      SMTP_USER: c.env?.SMTP_USER,
      SMTP2GO_API_KEY: c.env?.SMTP2GO_API_KEY,
    };
    sendContactNotificationEmail({ name, email, message, createdAt }, env).catch(() => {});

    return c.json(
      { success: true, message: 'Thanks! Your message is on its way 📬', data: newMessage },
      201
    );
  } catch (error) {
    console.error('Error saving message:', error);
    return c.json({ message: 'Failed to process message submission' }, 500);
  }
};

export const getMessages = async (c) => {
  try {
    const db = await getDB(c);
    if (db) {
      const col = db.collection('messages');
      const messages = await col.find().sort({ createdAt: -1 }).toArray();
      const unreadCount = await col.countDocuments({ isRead: false });
      return c.json({ messages, unreadCount });
    }

    const unreadCount = memoryMessages.filter((m) => !m.isRead).length;
    return c.json({ messages: memoryMessages, unreadCount });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ message: 'Failed to fetch messages' }, 500);
  }
};

export const markMessageAsRead = async (c) => {
  const { id } = c.req.param();

  try {
    const db = await getDB(c);
    if (db) {
      const oid = toObjectId(id);
      if (!oid) return c.json({ message: 'Message not found' }, 404);
      const col = db.collection('messages');
      const msg = await col.findOne({ _id: oid });
      if (!msg) return c.json({ message: 'Message not found' }, 404);

      const updated = await col.findOneAndUpdate(
        { _id: oid },
        { $set: { isRead: !msg.isRead } },
        { returnDocument: 'after' }
      );
      const unreadCount = await col.countDocuments({ isRead: false });
      return c.json({ message: updated, unreadCount });
    }

    const idx = memoryMessages.findIndex((m) => m._id === id);
    if (idx === -1) return c.json({ message: 'Message not found' }, 404);
    memoryMessages[idx].isRead = !memoryMessages[idx].isRead;
    const unreadCount = memoryMessages.filter((m) => !m.isRead).length;
    return c.json({ message: memoryMessages[idx], unreadCount });
  } catch (error) {
    console.error('Error toggling message read status:', error);
    return c.json({ message: 'Failed to update message status' }, 500);
  }
};

export const deleteMessage = async (c) => {
  const { id } = c.req.param();

  try {
    const db = await getDB(c);
    if (db) {
      const oid = toObjectId(id);
      if (!oid) return c.json({ message: 'Message not found' }, 404);
      const col = db.collection('messages');
      await col.deleteOne({ _id: oid });
      const unreadCount = await col.countDocuments({ isRead: false });
      return c.json({ message: 'Message deleted successfully', unreadCount });
    }

    const idx = memoryMessages.findIndex((m) => m._id === id);
    if (idx === -1) return c.json({ message: 'Message not found' }, 404);
    memoryMessages.splice(idx, 1);
    const unreadCount = memoryMessages.filter((m) => !m.isRead).length;
    return c.json({ message: 'Message deleted successfully', unreadCount });
  } catch (error) {
    console.error('Error deleting message:', error);
    return c.json({ message: 'Failed to delete message' }, 500);
  }
};
