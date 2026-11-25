import { getDB, toObjectId } from '../config/db.js';
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
      { url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80', publicId: 'img_3' },
    ],
    projectLink: 'https://github.com/nuthanprasadkg',
    githubLink: 'https://github.com/nuthanprasadkg',
    techStack: ['Python', 'FastAPI', 'React', 'LangChain', 'Pinecone', 'PyTorch'],
    order: 1,
    count: 142,
    projectDate: new Date('2026-01-15').toISOString(),
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
      { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', publicId: 'img_5' },
    ],
    projectLink: 'https://github.com/nuthanprasadkg',
    githubLink: 'https://github.com/nuthanprasadkg',
    techStack: ['React', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'Redis', 'TailwindCSS'],
    order: 2,
    count: 98,
    projectDate: new Date('2026-02-10').toISOString(),
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
      { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80', publicId: 'img_7' },
    ],
    projectLink: 'https://github.com/nuthanprasadkg',
    githubLink: 'https://github.com/nuthanprasadkg',
    techStack: ['Python', 'OpenCV', 'YOLOv8', 'Flask', 'React', 'WebSockets'],
    order: 3,
    count: 210,
    projectDate: new Date('2026-03-01').toISOString(),
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
      { url: 'https://images.unsplash.com/photo-1542744094-3a317272018a?auto=format&fit=crop&w=1000&q=80', publicId: 'img_9' },
    ],
    projectLink: 'https://github.com/nuthanprasadkg',
    githubLink: 'https://github.com/nuthanprasadkg',
    techStack: ['React', 'React Flow', 'GSAP', 'Express', 'MongoDB'],
    order: 4,
    count: 75,
    projectDate: new Date('2026-03-20').toISOString(),
    createdAt: new Date('2026-03-20').toISOString(),
    updatedAt: new Date('2026-03-20').toISOString(),
  },
];

const parseProjectDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const parseBoolean = (value) =>
  value === true || value === 'true' || value === '1' || value === 'on';

const sortProjectsByDate = (projects, sort = 'newest') => {
  const dir = sort === 'oldest' ? 1 : -1;
  return [...projects].sort((a, b) => {
    const dateA = new Date(a.projectDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.projectDate || b.createdAt || 0).getTime();
    return (dateA - dateB) * dir;
  });
};

const resolveOrderedImages = (imageOrderRaw, existingImages, uploadedNewImages) => {
  if (!imageOrderRaw) return null;
  let parsed;
  try {
    parsed = typeof imageOrderRaw === 'string' ? JSON.parse(imageOrderRaw) : imageOrderRaw;
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const existingByPublicId = new Map(
    (existingImages || []).filter((img) => img.publicId).map((img) => [img.publicId, img])
  );
  const existingByUrl = new Map(
    (existingImages || []).map((img) => [img.url, img])
  );

  const finalImages = [];
  for (const item of parsed) {
    if (item?.kind === 'existing') {
      const match =
        (item.publicId && existingByPublicId.get(item.publicId)) ||
        (item.url && existingByUrl.get(item.url));
      if (match) {
        finalImages.push({ url: match.url, publicId: match.publicId || '' });
      }
    } else if (item?.kind === 'new' && Number.isInteger(item.fileIndex)) {
      const uploaded = uploadedNewImages[item.fileIndex];
      if (uploaded) finalImages.push(uploaded);
    }
  }
  return finalImages;
};

// ── Helper: parse multipart form files using Web Fetch API ─────────────────
const parseMultipartFiles = async (c, fieldName = 'images', maxFiles = 5) => {
  try {
    const body = await c.req.parseBody({ all: true });
    const rawFiles = body[fieldName];
    if (!rawFiles) return { fields: body, files: [] };

    const fileArray = Array.isArray(rawFiles) ? rawFiles : [rawFiles];
    const files = fileArray
      .filter((f) => f instanceof File && f.size > 0)
      .slice(0, maxFiles);

    return { fields: body, files };
  } catch {
    return { fields: {}, files: [] };
  }
};

export const getProjects = async (c) => {
  try {
    const category = c.req.query('category');
    const sort = c.req.query('sort');
    const db = await getDB(c);

    if (db) {
      const filter = {};
      if (category && category !== 'All') filter.category = category;
      const projects = await db.collection('projects').find(filter).toArray();
      return c.json(sortProjectsByDate(projects, sort));
    }

    let filtered = memoryProjects;
    if (category && category !== 'All') {
      filtered = memoryProjects.filter((p) => p.category === category);
    }
    return c.json(sortProjectsByDate(filtered, sort));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json({ message: 'Failed to fetch projects' }, 500);
  }
};

export const getProjectById = async (c) => {
  const { id } = c.req.param();

  try {
    const db = await getDB(c);

    if (db) {
      const oid = toObjectId(id);
      if (!oid) return c.json({ message: 'Project not found' }, 404);
      const project = await db
        .collection('projects')
        .findOneAndUpdate(
          { _id: oid },
          { $inc: { count: 1 } },
          { returnDocument: 'after' }
        );
      if (!project) return c.json({ message: 'Project not found' }, 404);
      return c.json(project);
    }

    const index = memoryProjects.findIndex((p) => p._id === id);
    if (index === -1) return c.json({ message: 'Project not found' }, 404);
    memoryProjects[index].count = (memoryProjects[index].count || 0) + 1;
    return c.json(memoryProjects[index]);
  } catch (error) {
    console.error('Error fetching project detail:', error);
    return c.json({ message: 'Server error' }, 500);
  }
};

export const createProject = async (c) => {
  try {
    const { fields, files } = await parseMultipartFiles(c, 'images', 5);
    const { title, description, shortDescription, category, projectLink, githubLink, techStack, order, imageUrl, projectDate, isHardCoded } = fields;

    let uploadedImages = [];
    const cloudName = c.env?.CLOUDINARY_CLOUD_NAME;
    const cloudKey = c.env?.CLOUDINARY_API_KEY;
    const cloudSecret = c.env?.CLOUDINARY_API_SECRET;

    if (files.length > 0) {
      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const uploaded = await uploadToCloudinary(Buffer.from(buffer), 'portfolio_projects', cloudName, cloudKey, cloudSecret);
        uploadedImages.push(uploaded);
      }
    } else if (imageUrl) {
      uploadedImages.push({ url: imageUrl, publicId: `url_${Date.now()}` });
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

    const customDate = parseProjectDate(projectDate);
    const now = new Date();
    const effectiveDate = customDate || now;

    const projectData = {
      title,
      description,
      shortDescription: shortDescription || (description ? description.slice(0, 100) : ''),
      category: category || 'Web Dev',
      images: uploadedImages,
      projectLink: projectLink || '',
      githubLink: githubLink || '',
      techStack: parsedTechStack,
      order: Number(order) || 0,
      projectDate: effectiveDate,
      isHardCoded: parseBoolean(isHardCoded),
      count: 0,
      createdAt: effectiveDate,
      updatedAt: now,
    };

    const db = await getDB(c);
    if (db) {
      const result = await db.collection('projects').insertOne(projectData);
      return c.json({ _id: result.insertedId, ...projectData }, 201);
    }

    const newProj = {
      _id: `proj_${Date.now()}`,
      ...projectData,
      projectDate: effectiveDate.toISOString(),
      createdAt: effectiveDate.toISOString(),
      updatedAt: now.toISOString(),
    };
    memoryProjects.unshift(newProj);
    return c.json(newProj, 201);
  } catch (error) {
    console.error('Error creating project:', error);
    return c.json({ message: 'Failed to create project' }, 500);
  }
};

export const updateProject = async (c) => {
  const { id } = c.req.param();

  try {
    const { fields, files } = await parseMultipartFiles(c, 'images', 5);
    const { title, description, shortDescription, category, projectLink, githubLink, techStack, order, projectDate, imageOrder, imageUrl, isHardCoded } = fields;

    const cloudName = c.env?.CLOUDINARY_CLOUD_NAME;
    const cloudKey = c.env?.CLOUDINARY_API_KEY;
    const cloudSecret = c.env?.CLOUDINARY_API_SECRET;

    const parsedTechStack = Array.isArray(techStack)
      ? techStack
      : typeof techStack === 'string'
      ? techStack.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined;

    const newImages = [];
    if (files.length > 0) {
      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const uploaded = await uploadToCloudinary(Buffer.from(buffer), 'portfolio_projects', cloudName, cloudKey, cloudSecret);
        newImages.push(uploaded);
      }
    }

    const customDate = parseProjectDate(projectDate);

    const db = await getDB(c);
    if (db) {
      const oid = toObjectId(id);
      if (!oid) return c.json({ message: 'Project not found' }, 404);

      const existing = await db.collection('projects').findOne({ _id: oid });
      if (!existing) return c.json({ message: 'Project not found' }, 404);

      const updates = { updatedAt: new Date() };
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (shortDescription) updates.shortDescription = shortDescription;
      if (category) updates.category = category;
      if (projectLink !== undefined) updates.projectLink = projectLink;
      if (githubLink !== undefined) updates.githubLink = githubLink;
      if (parsedTechStack) updates.techStack = parsedTechStack;
      if (order !== undefined) updates.order = Number(order);
      if (isHardCoded !== undefined) updates.isHardCoded = parseBoolean(isHardCoded);
      if (customDate) {
        updates.projectDate = customDate;
        updates.createdAt = customDate;
      }

      const orderedImages = resolveOrderedImages(imageOrder, existing.images, newImages);
      if (orderedImages !== null) {
        if (orderedImages.length === 0 && imageUrl) {
          orderedImages.push({ url: imageUrl, publicId: `url_${Date.now()}` });
        }
        const keptIds = new Set(orderedImages.map((img) => img.publicId).filter(Boolean));
        for (const oldImg of existing.images || []) {
          if (oldImg.publicId && !keptIds.has(oldImg.publicId)) {
            deleteFromCloudinary(oldImg.publicId, 'image', cloudName, cloudKey, cloudSecret).catch(() => {});
          }
        }
        if (orderedImages.length > 0) {
          updates.images = orderedImages;
        }
      } else if (newImages.length > 0) {
        updates.images = newImages;
      }

      const updated = await db
        .collection('projects')
        .findOneAndUpdate(
          { _id: oid },
          { $set: updates },
          { returnDocument: 'after' }
        );
      if (!updated) return c.json({ message: 'Project not found' }, 404);
      return c.json(updated);
    }

    const idx = memoryProjects.findIndex((p) => p._id === id);
    if (idx === -1) return c.json({ message: 'Project not found' }, 404);

    if (title) memoryProjects[idx].title = title;
    if (description) memoryProjects[idx].description = description;
    if (shortDescription) memoryProjects[idx].shortDescription = shortDescription;
    if (category) memoryProjects[idx].category = category;
    if (projectLink !== undefined) memoryProjects[idx].projectLink = projectLink;
    if (githubLink !== undefined) memoryProjects[idx].githubLink = githubLink;
    if (parsedTechStack) memoryProjects[idx].techStack = parsedTechStack;
    if (order !== undefined) memoryProjects[idx].order = Number(order);
    if (isHardCoded !== undefined) memoryProjects[idx].isHardCoded = parseBoolean(isHardCoded);
    if (customDate) {
      memoryProjects[idx].projectDate = customDate.toISOString();
      memoryProjects[idx].createdAt = customDate.toISOString();
    }

    const orderedImages = resolveOrderedImages(imageOrder, memoryProjects[idx].images, newImages);
    if (orderedImages !== null && orderedImages.length > 0) {
      memoryProjects[idx].images = orderedImages;
    } else if (newImages.length > 0) {
      memoryProjects[idx].images = newImages;
    }
    memoryProjects[idx].updatedAt = new Date().toISOString();

    return c.json(memoryProjects[idx]);
  } catch (error) {
    console.error('Error updating project:', error);
    return c.json({ message: 'Failed to update project' }, 500);
  }
};

export const deleteProject = async (c) => {
  const { id } = c.req.param();

  try {
    const cloudName = c.env?.CLOUDINARY_CLOUD_NAME;
    const cloudKey = c.env?.CLOUDINARY_API_KEY;
    const cloudSecret = c.env?.CLOUDINARY_API_SECRET;

    const db = await getDB(c);
    if (db) {
      const oid = toObjectId(id);
      if (!oid) return c.json({ message: 'Project not found' }, 404);

      const project = await db.collection('projects').findOne({ _id: oid });
      if (!project) return c.json({ message: 'Project not found' }, 404);

      if (project.images?.length > 0) {
        for (const img of project.images) {
          if (img.publicId) await deleteFromCloudinary(img.publicId, 'image', cloudName, cloudKey, cloudSecret);
        }
      }

      await db.collection('projects').deleteOne({ _id: oid });
      return c.json({ message: 'Project deleted successfully' });
    }

    const idx = memoryProjects.findIndex((p) => p._id === id);
    if (idx === -1) return c.json({ message: 'Project not found' }, 404);

    memoryProjects.splice(idx, 1);
    return c.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return c.json({ message: 'Failed to delete project' }, 500);
  }
};
