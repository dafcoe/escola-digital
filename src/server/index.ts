import Fastify from 'fastify';
import { registerRoutes } from './routes';

const fastify = Fastify();

registerRoutes(fastify);

fastify.listen({ port: 3000 }, (error: Error | null, address: string) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`🚀 Server running at ${address}`);
});
