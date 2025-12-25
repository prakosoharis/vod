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
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true },
    });
    if (!user) {
        reply.code(401).send({ error: 'User not found' });
        return;
    }
    request.user = { userId: user.id, email: user.email };
}
// Backwards-compatible export name used in routes
export const authenticate = authenticateRequest;
export const authMiddleware = authenticateRequest;
//# sourceMappingURL=auth.js.map