import { FastifyInstance } from 'fastify';
export interface JWTPayload {
    userId: string;
    email?: string;
    sessionId?: string;
    purpose?: 'access' | 'password-reset';
}
export declare function registerJwt(fastify: FastifyInstance): Promise<void>;
export declare function generateToken(fastify: FastifyInstance, payload: JWTPayload): string;
export declare function generateToken(userId: string): string;
export declare function verifyToken(fastify: FastifyInstance, token: string): Promise<JWTPayload>;
export declare function verifyToken(token: string): JWTPayload | null;
//# sourceMappingURL=jwt.d.ts.map