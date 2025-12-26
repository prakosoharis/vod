import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../config/database.js';
import { ContentType } from '@prisma/client';

// Helper function to transform localhost URLs to production URLs
function transformMediaUrls(content: any) {
  if (!content) return content;

  const PRODUCTION_HLS_URL = process.env.HLS_CDN_URL || 'https://upload.transcode.mostara.id';
  const LOCALHOST_PATTERNS = [
    'http://localhost:8080',
    'http://localhost:8089',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8089',
  ];

  // Transform HLS URLs
  if (content.hls_url) {
    LOCALHOST_PATTERNS.forEach(pattern => {
      if (content.hls_url.startsWith(pattern)) {
        content.hls_url = content.hls_url.replace(pattern, PRODUCTION_HLS_URL);
      }
    });
  }

  if (content.hls_cdn_url) {
    LOCALHOST_PATTERNS.forEach(pattern => {
      if (content.hls_cdn_url.startsWith(pattern)) {
        content.hls_cdn_url = content.hls_cdn_url.replace(pattern, PRODUCTION_HLS_URL);
      }
    });
  }

  return content;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
  type?: string;
  genre?: string;
  featured?: string;
}

interface SearchQuery {
  q: string;
}

interface ContentParams {
  id: string;
}

// 1. getAllContent - Get all content with pagination and filters
export async function getAllContent(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const query = request.query as PaginationQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};
    
    if (query.type) {
      where.type = query.type as ContentType;
    }
    
    if (query.genre) {
      where.genre = {
        has: query.genre,
      };
    }
    
    if (query.featured !== undefined) {
      where.featured = query.featured === 'true';
    }

    const [data, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.content.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Transform URLs for all content items
    const transformedData = data.map(transformMediaUrls);

    reply.send({
      data: transformedData,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

// 2. getContentById - Get single content by ID
export async function getContentById(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params as ContentParams;

    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      reply.code(404).send({ error: 'Content not found' });
      return;
    }

    // Transform URLs before sending
    const transformedContent = transformMediaUrls(content);

    reply.send(transformedContent);
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

// 3. getFeaturedContent - Get featured content
export async function getFeaturedContent(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const data = await prisma.content.findMany({
      where: { featured: true },
      take: 10,
      orderBy: { created_at: 'desc' },
    });

    // Transform URLs for all content items
    const transformedData = data.map(transformMediaUrls);

    reply.send(transformedData);
  } catch (error) {
    console.error('Error fetching featured content:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

// 4. getTrendingContent - Get trending content (random for now)
export async function getTrendingContent(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Get all content first
    const allContent = await prisma.content.findMany({
      take: 100, // Get larger pool to randomize from
      orderBy: { created_at: 'desc' },
    });

    // Shuffle array randomly
    const shuffled = allContent.sort(() => Math.random() - 0.5);
    const data = shuffled.slice(0, 20); // Return 20 random items

    // Transform URLs for all content items
    const transformedData = data.map(transformMediaUrls);

    reply.send(transformedData);
  } catch (error) {
    console.error('Error fetching trending content:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

// 5. searchContent - Search content by query
export async function searchContent(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const { q } = request.query as SearchQuery;

    if (!q || q.trim().length === 0) {
      reply.code(400).send({ error: 'Search query is required' });
      return;
    }

    const data = await prisma.content.findMany({
      where: {
        OR: [
          {
            title: {
              contains: q,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: q,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform URLs for all content items
    const transformedData = data.map(transformMediaUrls);

    reply.send(transformedData);
  } catch (error) {
    console.error('Error searching content:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

// Admin Content Management
export async function createContent(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const body = request.body as {
      title?: string;
      description?: string;
      genre?: string[];
      year?: number;
      rating?: string;
      duration?: string;
      thumbnail_url?: string;
      backdrop_url?: string;
      video_url?: string;
      hls_url?: string;
      trailer_url?: string;
      cast?: Array<{ name: string; role: string }>;
      type?: string;
      featured?: boolean;
    } | undefined;

    if (!body?.title || !body?.description || !body?.genre || !body?.year || !body?.rating || !body?.duration || !body?.type || !body?.thumbnail_url) {
      reply.code(400).send({ error: 'Required fields: title, description, genre, year, rating, duration, type, thumbnail_url' });
      return;
    }

    const content = await prisma.content.create({
      data: {
        title: body.title,
        description: body.description,
        genre: body.genre,
        year: body.year,
        rating: new (await import('@prisma/client')).Prisma.Decimal(body.rating),
        duration: body.duration,
        thumbnail_url: body.thumbnail_url,
        backdrop_url: body.backdrop_url || undefined,
        video_url: body.video_url || undefined,
        hls_url: body.hls_url || undefined,
        trailer_url: body.trailer_url || undefined,
        cast: body.cast || [],
        type: body.type as ContentType,
        featured: body.featured || false,
      },
    });

    reply.code(201).send(content);
  } catch (error) {
    console.error('Error creating content:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateContent(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params as ContentParams;
    const body = request.body as {
      title?: string;
      description?: string;
      genre?: string[];
      year?: number;
      rating?: string;
      duration?: string;
      thumbnail_url?: string;
      backdrop_url?: string;
      video_url?: string;
      hls_url?: string;
      trailer_url?: string;
      cast?: Array<{ name: string; role: string }>;
      type?: string;
      featured?: boolean;
    } | undefined;

    if (!body || Object.keys(body).length === 0) {
      reply.code(400).send({ error: 'Nothing to update' });
      return;
    }

    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.genre !== undefined) updateData.genre = body.genre;
    if (body.year !== undefined) updateData.year = body.year;
    if (body.rating !== undefined) updateData.rating = new (await import('@prisma/client')).Prisma.Decimal(body.rating);
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.thumbnail_url !== undefined) updateData.thumbnail_url = body.thumbnail_url;
    if (body.backdrop_url !== undefined) updateData.backdrop_url = body.backdrop_url;
    if (body.video_url !== undefined) updateData.video_url = body.video_url;
    if (body.hls_url !== undefined) updateData.hls_url = body.hls_url;
    if (body.trailer_url !== undefined) updateData.trailer_url = body.trailer_url;
    if (body.cast !== undefined) updateData.cast = body.cast;
    if (body.type !== undefined) updateData.type = body.type as ContentType;
    if (body.featured !== undefined) updateData.featured = body.featured;

    const updated = await prisma.content.update({
      where: { id },
      data: updateData,
    });

    reply.send(updated);
  } catch (error) {
    if ((error as any)?.code === 'P2025') {
      reply.code(404).send({ error: 'Content not found' });
      return;
    }
    console.error('Error updating content:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

