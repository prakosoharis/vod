import prisma from '../config/database.js';
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
        reply.send({
            data,
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
        });
        if (!content) {
            reply.code(404).send({ error: 'Content not found' });
            return;
        }
        reply.send(content);
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
        });
        reply.send(data);
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
        });
        // Shuffle array randomly
        const shuffled = allContent.sort(() => Math.random() - 0.5);
        const data = shuffled.slice(0, 20); // Return 20 random items
        reply.send(data);
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
        });
        reply.send(data);
    }
    catch (error) {
        console.error('Error searching content:', error);
        reply.code(500).send({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=contentController.js.map