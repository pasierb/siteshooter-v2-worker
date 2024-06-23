import "dotenv/config";
import crypto from "crypto";
import Queue from "bull";
import Fastify from "fastify";
import bearerAuthPlugin from "@fastify/bearer-auth";
import { SCREENSHOT_WORKER_QUEUE } from "./queues.mjs";

const CDN_DOMAIN = process.env.CDN_DOMAIN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const jobsQueue = new Queue(
  SCREENSHOT_WORKER_QUEUE,
  process.env.REDIS_CONNECTION_STRING
);
const fastify = Fastify({ logger: true });
fastify.register(bearerAuthPlugin, { keys: new Set([ACCESS_TOKEN]) });

fastify.post("/v1/shoot", async (request, reply) => {
  const data = request.body;
  const { url, width = 1200, height = 627 } = data;
  const hash = crypto.createHash("sha256").update(url).digest("hex");
  const name = `${hash}.png`;

  try {
    console.log(`Adding job to queue: ${name}. ${JSON.stringify(data)}`);
    await jobsQueue.add({ url, name, width, height });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ error: "Failed to add job to queue" });
  }

  const screenshotUrl = new URL(name, `https://${CDN_DOMAIN}`).toString();

  return reply.code(200).send({ name, screenshotUrl });
});

try {
  await fastify.listen({ port: 3000 });
} catch (e) {
  process.exit(1);
}
