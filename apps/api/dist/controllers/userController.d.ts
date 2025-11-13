import { FastifyReply, FastifyRequest } from 'fastify';
export declare function getProfile(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function updateProfile(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function getUserById(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function getWatchlist(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function addToWatchlist(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function removeFromWatchlist(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function getWatchProgress(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function updateWatchProgress(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function getContinueWatching(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function getAllUsers(_request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function createUser(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function updateUser(request: FastifyRequest, reply: FastifyReply): Promise<void>;
//# sourceMappingURL=userController.d.ts.map