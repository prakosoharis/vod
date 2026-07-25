import prisma from '../config/database.js';
import { verifyToken } from '../utils/jwt.js';
export async function authenticateRequest(request, reply) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        reply.code(401).send({ error: 'No token provided' });
        return;
    }
    const [scheme, token] = authHeader.split(' ');
    if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
        reply.code(401).send({ error: 'No token provided' });
        return;
    }
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
        reply.code(401).send({ error: 'Invalid token' });
        return;
    }
    if (decoded.purpose && decoded.purpose !== 'access') {
        reply.code(401).send({ error: 'Invalid token' });
        return;
    }
    if (decoded.sessionId) {
        const session = await prisma.authSession.findUnique({
            where: { id: decoded.sessionId },
            select: { user_id: true, revoked_at: true, expires_at: true },
        });
        if (!session || session.user_id !== decoded.userId || session.revoked_at || session.expires_at <= new Date()) {
            reply.code(401).send({ error: 'Session expired' });
            return;
        }
    }
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, deleted_at: true },
    });
    if (!user || user.deleted_at) {
        reply.code(401).send({ error: 'User not found' });
        return;
    }
    request.user = { userId: user.id, email: user.email, sessionId: decoded.sessionId };
}
// Backwards-compatible export name used in routes
export const authenticate = authenticateRequest;
export const authMiddleware = authenticateRequest;
//# sourceMappingURL=auth.js.map