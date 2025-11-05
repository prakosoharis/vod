import fastifyJwt from '@fastify/jwt';
import jwt from 'jsonwebtoken';
export async function registerJwt(fastify) {
    await fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
}
export function generateToken(arg1, arg2) {
    // Legacy: fastify instance + payload
    if (typeof arg1 !== 'string' && arg2) {
        return arg1.jwt.sign(arg2, { expiresIn: '7d' });
    }
    // New: userId only, using jsonwebtoken and env secret
    const userId = arg1;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}
export function verifyToken(arg1, arg2) {
    // Legacy: fastify instance + token
    if (typeof arg1 !== 'string' && typeof arg2 === 'string') {
        return arg1.jwt.verify(arg2);
    }
    // New: token only, using jsonwebtoken and env secret
    const token = arg1;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return null;
    }
    try {
        const decoded = jwt.verify(token, secret);
        if (typeof decoded === 'string')
            return null;
        if (decoded && typeof decoded.userId === 'string') {
            return { userId: decoded.userId };
        }
        return null;
    }
    catch (err) {
        // Swallow all verification errors and return null as requested
        return null;
    }
}
//# sourceMappingURL=jwt.js.map