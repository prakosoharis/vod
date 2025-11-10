import { FastifyReply, FastifyRequest } from 'fastify';
import type { FastifyInstance } from 'fastify';
export declare function register(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function login(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function getMe(request: FastifyRequest, reply: FastifyReply): Promise<void>;
//# sourceMappingURL=authController.d.ts.map