import prisma from '../config/database.js';
export async function getProfile(request, reply) {
    try {
        const currentUser = request.user;
        if (!currentUser) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: currentUser.userId },
            select: {
                id: true,
                email: true,
                full_name: true,
                avatar_url: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!user) {
            reply.code(404).send({ error: 'User not found' });
            return;
        }
        reply.send(user);
    }
    catch (error) {
        reply.code(500).send({ error: 'Internal server error' });
    }
}
export async function updateProfile(request, reply) {
    try {
        const currentUser = request.user;
        if (!currentUser) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const body = request.body;
        if (!body || (body.full_name === undefined && body.avatar_url === undefined)) {
            reply.code(400).send({ error: 'Nothing to update' });
            return;
        }
        const updated = await prisma.user.update({
            where: { id: currentUser.userId },
            data: {
                ...(body.full_name !== undefined ? { full_name: body.full_name } : {}),
                ...(body.avatar_url !== undefined ? { avatar_url: body.avatar_url } : {}),
            },
            select: {
                id: true,
                email: true,
                full_name: true,
                avatar_url: true,
                created_at: true,
                updated_at: true,
            },
        });
        reply.send(updated);
    }
    catch (error) {
        if (error?.code === 'P2025') {
            reply.code(404).send({ error: 'User not found' });
            return;
        }
        reply.code(500).send({ error: 'Internal server error' });
    }
}
export async function getUserById(request, reply) {
    try {
        const { id } = request.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                full_name: true,
                avatar_url: true,
                created_at: true,
            },
        });
        if (!user) {
            reply.code(404).send({ error: 'User not found' });
            return;
        }
        reply.send(user);
    }
    catch (error) {
        reply.code(500).send({ error: 'Internal server error' });
    }
}
export async function getWatchlist(request, reply) {
    try {
        const currentUser = request.user;
        if (!currentUser) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const items = await prisma.watchlist.findMany({
            where: { user_id: currentUser.userId },
            include: { content: true },
            orderBy: { added_at: 'desc' },
        });
        const contents = items.map((w) => w.content);
        reply.send(contents);
    }
    catch (error) {
        reply.code(500).send({ error: 'Internal server error' });
    }
}
export async function addToWatchlist(request, reply) {
    try {
        const currentUser = request.user;
        if (!currentUser) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const body = request.body;
        const contentId = body?.content_id;
        if (!contentId) {
            reply.code(400).send({ error: 'content_id is required' });
            return;
        }
        const content = await prisma.content.findUnique({ where: { id: contentId } });
        if (!content) {
            reply.code(404).send({ error: 'Content not found' });
            return;
        }
        const existing = await prisma.watchlist.findUnique({
            where: {
                user_id_content_id: { user_id: currentUser.userId, content_id: contentId },
            },
        });
        if (existing) {
            reply.code(409).send({ error: 'Already in watchlist' });
            return;
        }
        const created = await prisma.watchlist.create({
            data: { user_id: currentUser.userId, content_id: contentId },
            include: { content: true },
        });
        reply.code(201).send(created);
    }
    catch (error) {
        reply.code(500).send({ error: 'Internal server error' });
    }
}
export async function removeFromWatchlist(request, reply) {
    try {
        const currentUser = request.user;
        if (!currentUser) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const { contentId } = request.params;
        if (!contentId) {
            reply.code(400).send({ error: 'contentId is required' });
            return;
        }
        await prisma.watchlist.deleteMany({
            where: { user_id: currentUser.userId, content_id: contentId },
        });
        reply.code(204).send();
    }
    catch (error) {
        reply.code(500).send({ error: 'Internal server error' });
    }
}
export async function getWatchProgress(request, reply) {
    try {
        const currentUser = request.user;
        if (!currentUser) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const { contentId } = request.params;
        if (!contentId) {
            reply.code(400).send({ error: 'contentId is required' });
            return;
        }
        const progress = await prisma.watchProgress.findUnique({
            where: {
                user_id_content_id: { user_id: currentUser.userId, content_id: contentId },
            },
            select: { progress_seconds: true, last_watched: true },
        });
        if (!progress) {
            reply.code(404).send({ error: 'Progress not found' });
            return;
        }
        reply.send(progress);
    }
    catch (error) {
        reply.code(500).send({ error: 'Internal server error' });
    }
}
export async function updateWatchProgress(request, reply) {
    try {
        const currentUser = request.user;
        if (!currentUser) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const { contentId } = request.params;
        const body = request.body;
        if (!contentId) {
            reply.code(400).send({ error: 'contentId is required' });
            return;
        }
        if (typeof body?.progress_seconds !== 'number' || body.progress_seconds < 0) {
            reply.code(400).send({ error: 'progress_seconds must be a non-negative number' });
            return;
        }
        const content = await prisma.content.findUnique({ where: { id: contentId } });
        if (!content) {
            reply.code(404).send({ error: 'Content not found' });
            return;
        }
        const upserted = await prisma.watchProgress.upsert({
            where: { user_id_content_id: { user_id: currentUser.userId, content_id: contentId } },
            create: {
                user_id: currentUser.userId,
                content_id: contentId,
                progress_seconds: body.progress_seconds,
                last_watched: new Date(),
            },
            update: {
                progress_seconds: body.progress_seconds,
                last_watched: new Date(),
            },
            select: { progress_seconds: true, last_watched: true },
        });
        reply.send(upserted);
    }
    catch (error) {
        reply.code(500).send({ error: 'Internal server error' });
    }
}
function estimateContentDurationSeconds(duration) {
    if (!duration)
        return null;
    const lower = duration.toLowerCase();
    const minMatch = lower.match(/(\d+)\s*min/);
    if (minMatch) {
        const minutes = parseInt(minMatch[1], 10);
        return Number.isFinite(minutes) ? minutes * 60 : null;
    }
    const epMatch = lower.match(/(\d+)\s*episode/);
    if (epMatch) {
        const episodes = parseInt(epMatch[1], 10);
        // Assume ~45 minutes per episode
        return Number.isFinite(episodes) ? episodes * 45 * 60 : null;
    }
    return null;
}
export async function getContinueWatching(request, reply) {
    try {
        if (!request.user) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const currentUser = request.user;
        if (!currentUser) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const progresses = await prisma.watchProgress.findMany({
            where: { user_id: currentUser.userId },
            include: { content: true },
            orderBy: { last_watched: 'desc' },
            take: 100, // fetch more, filter in app, then limit 10
        });
        const filtered = progresses
            .filter((p) => {
            const est = estimateContentDurationSeconds(p.content.duration);
            if (!est)
                return true; // if unknown, keep it as continue watching
            const percent = (p.progress_seconds / est) * 100;
            return percent < 95;
        })
            .slice(0, 10)
            .map((p) => ({ ...p.content, progress_seconds: p.progress_seconds, last_watched: p.last_watched }));
        reply.send(filtered);
    }
    catch (error) {
        reply.code(500).send({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=userController.js.map