import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      full_name?: string | null;
      avatar_url?: string | null;
    };
  }
}

export {};


