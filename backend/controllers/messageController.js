import Message from '../models/Message.js';
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
  }
];

export const createMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required fields.' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  try {
    let newMessage;
    const createdAt = new Date();

    if (Message.db && Message.db.readyState === 1) {
      newMessage = await Message.create({
        name,
        email,
        message,
        isRead: false,
        createdAt,
      });
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

    // Trigger Nodemailer background notification
    sendContactNotificationEmail({ name, email, message, createdAt });

    res.status(201).json({
      success: true,
      message: 'Thanks! Your message is on its way 📬',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Failed to process message submission' });
  }
};

export const getMessages = async (req, res) => {
  try {
    if (Message.db && Message.db.readyState === 1) {
      const messages = await Message.find().sort({ createdAt: -1 });
      const unreadCount = await Message.countDocuments({ isRead: false });
      return res.json({ messages, unreadCount });
    }

    const unreadCount = memoryMessages.filter((m) => !m.isRead).length;
    res.json({ messages: memoryMessages, unreadCount });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const markMessageAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    if (Message.db && Message.db.readyState === 1) {
      const msg = await Message.findById(id);
      if (!msg) return res.status(404).json({ message: 'Message not found' });
      msg.isRead = !msg.isRead;
      await msg.save();

      const unreadCount = await Message.countDocuments({ isRead: false });
      return res.json({ message: msg, unreadCount });
    }

    const idx = memoryMessages.findIndex((m) => m._id === id);
    if (idx === -1) return res.status(404).json({ message: 'Message not found' });

    memoryMessages[idx].isRead = !memoryMessages[idx].isRead;
    const unreadCount = memoryMessages.filter((m) => !m.isRead).length;
    res.json({ message: memoryMessages[idx], unreadCount });
  } catch (error) {
    console.error('Error toggling message read status:', error);
    res.status(500).json({ message: 'Failed to update message status' });
  }
};

export const deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    if (Message.db && Message.db.readyState === 1) {
      await Message.findByIdAndDelete(id);
      const unreadCount = await Message.countDocuments({ isRead: false });
      return res.json({ message: 'Message deleted successfully', unreadCount });
    }

    const idx = memoryMessages.findIndex((m) => m._id === id);
    if (idx === -1) return res.status(404).json({ message: 'Message not found' });

    memoryMessages.splice(idx, 1);
    const unreadCount = memoryMessages.filter((m) => !m.isRead).length;
    res.json({ message: 'Message deleted successfully', unreadCount });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};
