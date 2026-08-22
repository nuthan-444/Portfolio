import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Message from '../models/Message.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_db';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB...');

    // 1. Seed Admin User
    await User.deleteMany({});
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminEmail = (process.env.ADMIN_EMAIL || 'forcodingstuffs@gmail.com').toLowerCase();
    const adminUser = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'Nuthan Prasad KG',
      isAdmin: true,
    });
    console.log(`[Seeder] Admin user created: ${adminUser.email} / admin123`);

    // 2. Seed Projects
    await Project.deleteMany({});
    const projects = [
      {
        title: 'NexusAI - Autonomous Multi-Agent RAG Orchestrator',
        description: 'A state-of-the-art multi-agent RAG system powered by LangChain, LlamaIndex, and Vector DBs. Enables real-time document reasoning, live web synthesis, and automated code execution.',
        shortDescription: 'Multi-agent RAG orchestrator with vector search and dynamic tools.',
        category: 'AI/ML',
        images: [
          { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80', publicId: 'img_1' },
          { url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1000&q=80', publicId: 'img_2' },
          { url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80', publicId: 'img_3' }
        ],
        projectLink: 'https://github.com/nuthanprasadkg',
        githubLink: 'https://github.com/nuthanprasadkg',
        techStack: ['Python', 'FastAPI', 'React', 'LangChain', 'Pinecone', 'PyTorch'],
        order: 1,
        count: 142,
      },
      {
        title: 'HyperDrive - High Performance E-Commerce Engine',
        description: 'Full-stack enterprise e-commerce platform built with Next.js 14 App Router, Stripe Connect payments, microservices backend in Node.js, and Redis caching for ultra-low latency.',
        shortDescription: 'Ultra-fast full-stack storefront with Stripe Connect & Redis.',
        category: 'Web Dev',
        images: [
          { url: 'https://images.unsplash.com/photo-1556742049-0a67daf4004a?auto=format&fit=crop&w=1000&q=80', publicId: 'img_4' },
          { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', publicId: 'img_5' }
        ],
        projectLink: 'https://github.com/nuthanprasadkg',
        githubLink: 'https://github.com/nuthanprasadkg',
        techStack: ['React', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'Redis', 'TailwindCSS'],
        order: 2,
        count: 98,
      },
      {
        title: 'VisionPulse - Real-time Object & Anomaly Detector',
        description: 'Computer vision web application integrating YOLOv8 and WebRTC stream processing for real-time surveillance, motion tracking, and automated alert triggers.',
        shortDescription: 'YOLOv8 & WebRTC powered visual stream analyzer.',
        category: 'AI/ML',
        images: [
          { url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1000&q=80', publicId: 'img_6' },
          { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80', publicId: 'img_7' }
        ],
        projectLink: 'https://github.com/nuthanprasadkg',
        githubLink: 'https://github.com/nuthanprasadkg',
        techStack: ['Python', 'OpenCV', 'YOLOv8', 'Flask', 'React', 'WebSockets'],
        order: 3,
        count: 210,
      },
      {
        title: 'FlowCraft - Drag & Drop Visual Workflow Builder',
        description: 'Interactive canvas web app built with React Flow, Framer Motion, and Node.js backend. Features live execution graphs, custom node editors, and JSON export/import.',
        shortDescription: 'Interactive node-based automation flow builder.',
        category: 'Web Dev',
        images: [
          { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', publicId: 'img_8' },
          { url: 'https://images.unsplash.com/photo-1542744094-3a317272018a?auto=format&fit=crop&w=1000&q=80', publicId: 'img_9' }
        ],
        projectLink: 'https://github.com/nuthanprasadkg',
        githubLink: 'https://github.com/nuthanprasadkg',
        techStack: ['React', 'React Flow', 'GSAP', 'Express', 'MongoDB'],
        order: 4,
        count: 75,
      }
    ];

    await Project.insertMany(projects);
    console.log(`[Seeder] Seeded ${projects.length} portfolio projects.`);

    // 3. Seed Sample Message
    await Message.deleteMany({});
    await Message.create({
      name: 'Steve Jobs',
      email: 'steve@apple.com',
      message: 'Insanely great work on your AI agents portfolio Nuthan! Keep innovating.',
      isRead: false,
    });
    console.log('[Seeder] Seeded sample message.');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]', error);
    process.exit(1);
  }
};

seedData();
