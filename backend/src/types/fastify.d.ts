import type { FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireVerified: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    /** Set by the `authenticate` guard from the JWT subject. */
    userId: string;
    /** Set by the `requireAdmin` guard. */
    adminId: string;
    adminRole: string;
    /** Raw JSON body, retained for Stripe webhook signature verification. */
    rawBody?: string;
  }
}
