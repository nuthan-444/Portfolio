import Project from '../models/Project.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// Initial sample seed projects for fallback when MongoDB is offline
let memoryProjects = [
  {
    _id: 'proj_101',
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
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-01-15').toISOString(),
  },
  {
    _id: 'proj_102',
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
    createdAt: new Date('2026-02-10').toISOString(),
    updatedAt: new Date('2026-02-10').toISOString(),
  },
  {
    _id: 'proj_103',
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
    createdAt: new Date('2026-03-01').toISOString(),
    updatedAt: new Date('2026-03-01').toISOString(),
  },
  {
    _id: 'proj_104',
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
    createdAt: new Date('2026-03-20').toISOString(),
    updatedAt: new Date('2026-03-20').toISOString(),
  }
];

export const getProjects = async (req, res) => {
  try {
    const { category } = req.query;

    if (Project.db && Project.db.readyState === 1) {
      let filter = {};
      if (category && category !== 'All') {
        filter.category = category;
      }
      const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
      return res.json(projects);
    }

    // Memory fallback
    let filtered = memoryProjects;
    if (category && category !== 'All') {
      filtered = memoryProjects.filter((p) => p.category === category);
    }
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    if (Project.db && Project.db.readyState === 1) {
      const project = await Project.findByIdAndUpdate(id, { $inc: { count: 1 } }, { new: true });
      if (!project) return res.status(404).json({ message: 'Project not found' });
      return res.json(project);
    }

    const index = memoryProjects.findIndex((p) => p._id === id);
    if (index === -1) return res.status(404).json({ message: 'Project not found' });
    memoryProjects[index].count = (memoryProjects[index].count || 0) + 1;
    res.json(memoryProjects[index]);
  } catch (error) {
    console.error('Error fetching project detail:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, shortDescription, category, projectLink, githubLink, techStack, order } = req.body;
    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        uploadedImages.push(uploaded);
      }
    } else if (req.body.imageUrl) {
      uploadedImages.push({ url: req.body.imageUrl, publicId: `url_${Date.now()}` });
    }

    if (uploadedImages.length === 0) {
      uploadedImages.push({
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
        publicId: `default_${Date.now()}`,
      });
    }

    const parsedTechStack = Array.isArray(techStack)
      ? techStack
      : typeof techStack === 'string'
      ? techStack.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const projectData = {
      title,
      description,
      shortDescription: shortDescription || description.slice(0, 100),
      category: category || 'Web Dev',
      images: uploadedImages,
      projectLink: projectLink || '',
      githubLink: githubLink || '',
      techStack: parsedTechStack,
      order: Number(order) || 0,
      count: 0,
    };

    if (Project.db && Project.db.readyState === 1) {
      const project = await Project.create(projectData);
      return res.status(201).json(project);
    }

    // Memory fallback
    const newProj = {
      _id: `proj_${Date.now()}`,
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryProjects.unshift(newProj);
    res.status(201).json(newProj);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

export const updateProject = async (req, res) => {
  const { id } = req.params;

  try {
    const { title, description, shortDescription, category, projectLink, githubLink, techStack, order } = req.body;

    const parsedTechStack = Array.isArray(techStack)
      ? techStack
      : typeof techStack === 'string'
      ? techStack.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined;

    let newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer);
        newImages.push(uploaded);
      }
    }

    if (Project.db && Project.db.readyState === 1) {
      const existing = await Project.findById(id);
      if (!existing) return res.status(404).json({ message: 'Project not found' });

      if (title) existing.title = title;
      if (description) existing.description = description;
      if (shortDescription) existing.shortDescription = shortDescription;
      if (category) existing.category = category;
      if (projectLink !== undefined) existing.projectLink = projectLink;
      if (githubLink !== undefined) existing.githubLink = githubLink;
      if (parsedTechStack) existing.techStack = parsedTechStack;
      if (order !== undefined) existing.order = Number(order);
      if (newImages.length > 0) existing.images = newImages;

      await existing.save();
      return res.json(existing);
    }

    // Memory fallback
    const idx = memoryProjects.findIndex((p) => p._id === id);
    if (idx === -1) return res.status(404).json({ message: 'Project not found' });

    if (title) memoryProjects[idx].title = title;
    if (description) memoryProjects[idx].description = description;
    if (shortDescription) memoryProjects[idx].shortDescription = shortDescription;
    if (category) memoryProjects[idx].category = category;
    if (projectLink !== undefined) memoryProjects[idx].projectLink = projectLink;
    if (githubLink !== undefined) memoryProjects[idx].githubLink = githubLink;
    if (parsedTechStack) memoryProjects[idx].techStack = parsedTechStack;
    if (order !== undefined) memoryProjects[idx].order = Number(order);
    if (newImages.length > 0) memoryProjects[idx].images = newImages;
    memoryProjects[idx].updatedAt = new Date().toISOString();

    res.json(memoryProjects[idx]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    if (Project.db && Project.db.readyState === 1) {
      const project = await Project.findById(id);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      if (project.images && project.images.length > 0) {
        for (const img of project.images) {
          if (img.publicId) await deleteFromCloudinary(img.publicId);
        }
      }

      await Project.findByIdAndDelete(id);
      return res.json({ message: 'Project deleted successfully' });
    }

    const idx = memoryProjects.findIndex((p) => p._id === id);
    if (idx === -1) return res.status(404).json({ message: 'Project not found' });

    memoryProjects.splice(idx, 1);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};
