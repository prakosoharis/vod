import prisma from '../config/database.js';
import { Prisma } from '@prisma/client';
// Helper function to transform localhost URLs to production URLs
function transformMediaUrls(content) {
    if (!content)
        return content;
    // Skip transform if explicitly disabled (for local development with docker)
    if (process.env.DISABLE_HLS_TRANSFORM === 'true') {
        return content;
    }
    const PRODUCTION_HLS_URL = process.env.HLS_CDN_URL || 'https://upload.transcode.smashstream.id';
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
const episodeInclude = {
    where: { is_published: true },
    orderBy: [{ season_number: 'asc' }, { episode_number: 'asc' }],
};
function validateEpisodes(type, episodes) {
    if (type !== 'SERIES' || !episodes)
        return null;
    const keys = new Set();
    for (const episode of episodes) {
        if (!episode.title?.trim() || !episode.duration?.trim() || episode.season_number < 1 || episode.episode_number < 1) {
            return 'Setiap episode wajib memiliki judul, durasi, season, dan nomor episode yang valid';
        }
        const key = `${episode.season_number}:${episode.episode_number}`;
        if (keys.has(key))
            return `Episode S${episode.season_number}E${episode.episode_number} duplikat`;
        keys.add(key);
    }
    return null;
}
function toEpisodeCreateData(episode) {
    return {
        season_number: Number(episode.season_number),
        episode_number: Number(episode.episode_number),
        title: episode.title.trim(),
        description: episode.description?.trim() || null,
        duration: episode.duration.trim(),
        thumbnail_url: episode.thumbnail_url || null,
        video_url: episode.video_url || null,
        hls_url: episode.hls_url || null,
        is_published: episode.is_published ?? true,
    };
}
// 1. getAllContent - Get all content with pagination and filters
export async function getAllContent(request, reply) {
    try {
        const query = request.query;
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const skip = (page - 1) * limit;
        // Build where clause based on filters
        const where = {};
        if (query.type) {
            where.type = query.type;
        }
        if (query.genre) {
            where.genre = {
                has: query.genre,
            };
        }
        if (query.featured !== undefined) {
            where.featured = query.featured === 'true';
        }
        if (query.homepage_section === 'latest')
            where.show_in_latest = true;
        if (query.homepage_section === 'movie_picks')
            where.show_in_movie_picks = true;
        if (query.homepage_section === 'popular_series')
            where.show_in_popular_series = true;
        const [data, total] = await Promise.all([
            prisma.content.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    rental_price: true,
                    _count: { select: { rentals: true } },
                    episodes: episodeInclude,
                },
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
    }
    catch (error) {
        console.error('Error fetching content:', error);
        reply.code(500).send({ error: 'Internal server error' });
    }
}
// 2. getContentById - Get single content by ID
export async function getContentById(request, reply) {
    try {
        const { id } = request.params;
        const content = await prisma.content.findUnique({
            where: { id },
            include: {
                rental_price: true,
                _count: { select: { rentals: true } },
                episodes: episodeInclude,
            },
        });
        if (!content) {
            reply.code(404).send({ error: 'Content not found' });
            return;
        }
        // Transform URLs before sending
        const transformedContent = transformMediaUrls(content);
        reply.send(transformedContent);
    }
    catch (error) {
        console.error('Error fetching content by ID:', error);
        reply.code(500).send({ error: 'Internal server error' });
    }
}
// 3. getFeaturedContent - Get featured content
export async function getFeaturedContent(_request, reply) {
    try {
        const data = await prisma.content.findMany({
            where: { featured: true },
            take: 10,
            orderBy: { created_at: 'desc' },
            include: { rental_price: true, episodes: episodeInclude },
        });
        // Transform URLs for all content items
        const transformedData = data.map(transformMediaUrls);
        reply.send(transformedData);
    }
    catch (error) {
        console.error('Error fetching featured content:', error);
        reply.code(500).send({ error: 'Internal server error' });
    }
}
// 4. getTrendingContent - Get trending content (random for now)
export async function getTrendingContent(_request, reply) {
    try {
        // Get all content first
        const allContent = await prisma.content.findMany({
            take: 100, // Get larger pool to randomize from
            orderBy: { created_at: 'desc' },
            include: { rental_price: true, episodes: episodeInclude },
        });
        // Shuffle array randomly
        const shuffled = allContent.sort(() => Math.random() - 0.5);
        const data = shuffled.slice(0, 20); // Return 20 random items
        // Transform URLs for all content items
        const transformedData = data.map(transformMediaUrls);
        reply.send(transformedData);
    }
    catch (error) {
        console.error('Error fetching trending content:', error);
        reply.code(500).send({ error: 'Internal server error' });
    }
}
// 5. searchContent - Search content by query
export async function searchContent(request, reply) {
    try {
        const { q } = request.query;
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
            include: { rental_price: true, episodes: episodeInclude },
        });
        // Transform URLs for all content items
        const transformedData = data.map(transformMediaUrls);
        reply.send(transformedData);
    }
    catch (error) {
        console.error('Error searching content:', error);
        reply.code(500).send({ error: 'Internal server error' });
    }
}
// Admin Content Management
export async function createContent(request, reply) {
    try {
        const body = request.body;
        if (!body?.title || !body?.description || !body?.genre || !body?.year || !body?.rating || !body?.duration || !body?.type || !body?.thumbnail_url || !body.rental_price_amount || !body.rental_duration_hours) {
            reply.code(400).send({ error: 'Data film, tarif sewa, dan durasi sewa wajib diisi' });
            return;
        }
        if (body.rental_price_amount < 1 || !Number.isInteger(body.rental_duration_hours) || body.rental_duration_hours < 1) {
            reply.code(400).send({ error: 'Tarif harus lebih dari 0 dan durasi sewa minimal 1 jam' });
            return;
        }
        const episodeError = validateEpisodes(body.type, body.episodes);
        if (episodeError) {
            reply.code(400).send({ error: episodeError });
            return;
        }
        if (body.show_in_latest && await prisma.content.count({ where: { show_in_latest: true } }) >= 10) {
            reply.code(400).send({ error: 'Rilis Terbaru maksimal berisi 10 film. Hapus pilihan lain terlebih dahulu.' });
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
                type: body.type,
                featured: body.featured || false,
                show_in_latest: body.type === 'MOVIE' && (body.show_in_latest ?? false),
                show_in_movie_picks: body.type === 'MOVIE' && (body.show_in_movie_picks ?? false),
                show_in_popular_series: body.type === 'SERIES' && (body.show_in_popular_series ?? false),
                rental_price: {
                    create: {
                        price: new Prisma.Decimal(body.rental_price_amount),
                        duration_hours: body.rental_duration_hours,
                        is_active: body.rental_active ?? true,
                    },
                },
                ...(body.type === 'SERIES' && body.episodes?.length ? {
                    episodes: {
                        create: body.episodes.map(toEpisodeCreateData),
                    },
                } : {}),
            },
            include: { rental_price: true, episodes: episodeInclude, _count: { select: { rentals: true } } },
        });
        reply.code(201).send(content);
    }
    catch (error) {
        console.error('Error creating content:', error);
        reply.code(500).send({ error: 'Internal server error' });
    }
}
export async function updateContent(request, reply) {
    try {
        const { id } = request.params;
        const body = request.body;
        if (!body || Object.keys(body).length === 0) {
            reply.code(400).send({ error: 'Nothing to update' });
            return;
        }
        if (body.rental_price_amount !== undefined && body.rental_price_amount < 1) {
            reply.code(400).send({ error: 'Tarif sewa harus lebih dari 0' });
            return;
        }
        if (body.rental_duration_hours !== undefined && (!Number.isInteger(body.rental_duration_hours) || body.rental_duration_hours < 1)) {
            reply.code(400).send({ error: 'Durasi sewa minimal 1 jam' });
            return;
        }
        const existingContent = await prisma.content.findUnique({
            where: { id },
            select: { type: true, show_in_latest: true },
        });
        const effectiveType = body.type ?? existingContent?.type;
        const episodeError = validateEpisodes(effectiveType, body.episodes);
        if (episodeError) {
            reply.code(400).send({ error: episodeError });
            return;
        }
        if (body.show_in_latest && !existingContent?.show_in_latest && await prisma.content.count({ where: { show_in_latest: true } }) >= 10) {
            reply.code(400).send({ error: 'Rilis Terbaru maksimal berisi 10 film. Hapus pilihan lain terlebih dahulu.' });
            return;
        }
        const updateData = {};
        if (body.title !== undefined)
            updateData.title = body.title;
        if (body.description !== undefined)
            updateData.description = body.description;
        if (body.genre !== undefined)
            updateData.genre = body.genre;
        if (body.year !== undefined)
            updateData.year = body.year;
        if (body.rating !== undefined)
            updateData.rating = new (await import('@prisma/client')).Prisma.Decimal(body.rating);
        if (body.duration !== undefined)
            updateData.duration = body.duration;
        if (body.thumbnail_url !== undefined)
            updateData.thumbnail_url = body.thumbnail_url;
        if (body.backdrop_url !== undefined)
            updateData.backdrop_url = body.backdrop_url;
        if (body.video_url !== undefined)
            updateData.video_url = body.video_url;
        if (body.hls_url !== undefined)
            updateData.hls_url = body.hls_url;
        if (body.trailer_url !== undefined)
            updateData.trailer_url = body.trailer_url;
        if (body.cast !== undefined)
            updateData.cast = body.cast;
        if (body.type !== undefined)
            updateData.type = body.type;
        if (body.featured !== undefined)
            updateData.featured = body.featured;
        if (body.show_in_latest !== undefined)
            updateData.show_in_latest = effectiveType === 'MOVIE' && body.show_in_latest;
        if (body.show_in_movie_picks !== undefined)
            updateData.show_in_movie_picks = effectiveType === 'MOVIE' && body.show_in_movie_picks;
        if (body.show_in_popular_series !== undefined)
            updateData.show_in_popular_series = effectiveType === 'SERIES' && body.show_in_popular_series;
        if (body.type === 'MOVIE')
            updateData.show_in_popular_series = false;
        if (body.type === 'SERIES') {
            updateData.show_in_latest = false;
            updateData.show_in_movie_picks = false;
        }
        if (body.episodes !== undefined) {
            updateData.episodes = effectiveType === 'SERIES'
                ? {
                    deleteMany: {},
                    create: body.episodes.map(toEpisodeCreateData),
                }
                : { deleteMany: {} };
        }
        else if (body.type === 'MOVIE') {
            updateData.episodes = { deleteMany: {} };
        }
        if (body.rental_price_amount !== undefined || body.rental_duration_hours !== undefined || body.rental_active !== undefined) {
            const existing = await prisma.rentalPrice.findUnique({ where: { content_id: id } });
            const price = body.rental_price_amount !== undefined ? new Prisma.Decimal(body.rental_price_amount) : existing?.price;
            const durationHours = body.rental_duration_hours ?? existing?.duration_hours;
            if (!price || !durationHours) {
                reply.code(400).send({ error: 'Tarif dan durasi sewa wajib diisi' });
                return;
            }
            updateData.rental_price = {
                upsert: {
                    create: { price, duration_hours: durationHours, is_active: body.rental_active ?? true },
                    update: {
                        ...(body.rental_price_amount !== undefined ? { price } : {}),
                        ...(body.rental_duration_hours !== undefined ? { duration_hours: durationHours } : {}),
                        ...(body.rental_active !== undefined ? { is_active: body.rental_active } : {}),
                    },
                },
            };
        }
        const updated = await prisma.content.update({
            where: { id },
            data: updateData,
            include: { rental_price: true, episodes: episodeInclude, _count: { select: { rentals: true } } },
        });
        reply.send(updated);
    }
    catch (error) {
        if (error?.code === 'P2025') {
            reply.code(404).send({ error: 'Content not found' });
            return;
        }
        console.error('Error updating content:', error);
        reply.code(500).send({ error: 'Internal server error' });
    }
}
export async function getContentRentals(request, reply) {
    const { id } = request.params;
    const content = await prisma.content.findUnique({
        where: { id },
        select: { id: true, title: true },
    });
    if (!content) {
        reply.code(404).send({ error: 'Content not found' });
        return;
    }
    const rentals = await prisma.userRental.findMany({
        where: { content_id: id },
        include: {
            user: { select: { id: true, email: true, full_name: true } },
        },
        orderBy: { rented_at: 'desc' },
    });
    const now = new Date();
    reply.send({
        content,
        summary: {
            total_rentals: rentals.length,
            unique_renters: new Set(rentals.map((item) => item.user_id)).size,
            active_rentals: rentals.filter((item) => item.expired_at > now).length,
            gross_revenue: rentals.reduce((total, item) => total + Number(item.price_paid), 0),
        },
        rentals: rentals.map((item) => ({
            ...item,
            is_active: item.expired_at > now,
        })),
    });
}
//# sourceMappingURL=contentController.js.map