import Fastify from 'fastify';
import cors from '@fastify/cors';
import { FastifySSEPlugin } from 'fastify-sse-v2';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { registerRoutes } from './routes.mjs';

const fastify = Fastify();
await fastify.register(cors, { origin: '*' });
await fastify.register(FastifySSEPlugin);
await fastify.register(fastifyStatic, {
  root: path.resolve('reports'),
  prefix: '/static/',
});

registerRoutes(fastify);
startServer();

function startServer() {
  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`🚀 Server running at ${address}`);
  });
}
