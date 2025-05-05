import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

export function registerRoutes(fastify: FastifyInstance) {
  registerRoutePostRun(fastify);
}

function registerRoutePostRun(fastify: FastifyInstance) {
  fastify.post('/run', (request: FastifyRequest, reply: FastifyReply) => {
    const { reportName, reportNifs } = request.body as { reportName: string; reportNifs: string };
    const process = spawn(
      'node',
      [
        './dist/scrapper/index.js',
        `--name=${reportName}`,
        `--nifs=${reportNifs}`,
      ]);

    return reply.sse(streamOutput(process));
  });
}

async function* streamOutput(process: ChildProcessWithoutNullStreams) {
  for await (const chunk of process.stdout) {
    yield { data: chunk.toString() };
  }

  for await (const chunk of process.stderr) {
    yield { data: `[error] ${chunk.toString()}` };
  }
}
