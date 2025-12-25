import { FastifyRequest, FastifyReply } from 'fastify';
export declare function authenticateRequest(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare const authenticate: typeof authenticateRequest;
export declare const authMiddleware: typeof authenticateRequest;
//# sourceMappingURL=auth.d.ts.map