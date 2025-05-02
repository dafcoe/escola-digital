import { run } from '../scrapper';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export function registerRoutes(fastify: FastifyInstance) {
  registerPostRunRoute(fastify);
}

function registerPostRunRoute(fastify: FastifyInstance) {
  fastify.post('/run', async (request: FastifyRequest, reply: FastifyReply) => {
    const { param1, param2 } = request.body as {
      param1: string;
      param2: string;
    };

    console.log(param1, param2);

    try {
      const result = await run();

      return { output: result };
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  });
}
