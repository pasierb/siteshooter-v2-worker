import "dotenv/config";
import crypto from "crypto";
import Queue from "bull";
import Fastify from "fastify";
import bearerAuthPlugin from "@fastify/bearer-auth";
import { doesExist } from "./store.mjs";
import { SCREENSHOT_WORKER_QUEUE } from "./queues.mjs";

const CDN_DOMAIN = process.env.CDN_DOMAIN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const jobsQueue = new Queue(
  SCREENSHOT_WORKER_QUEUE,
  process.env.REDIS_CONNECTION_STRING
);
const fastify = Fastify({ logger: true });

const callbacks = {};

// Not perfect, but can not make it to work with non global events.
jobsQueue.on("global:completed", (job) => {
  console.log(`Global Job completed: ${job}`);
  if (callbacks[job]) {
    callbacks[job]();
    callbacks[job] = null;
  }
});

fastify.register(bearerAuthPlugin, { keys: new Set([ACCESS_TOKEN]) });
fastify.post("/v1/shoot", async (request, reply) => {
  const data = request.body;
  const { url, width = 1200, height = 627, hideElements = [] } = data;

  let jobData = { url, width, height, hideElements };
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(jobData))
    .digest("hex");
  const name = `${hash}.png`;
  jobData = { ...jobData, name };

  try {
    if (await doesExist(name)) {
      console.log(`Screenshot ${name} already exists`);
    } else {
      const scheduledJob = await jobsQueue.add(jobData);
      await new Promise((resolve) => {
        callbacks[scheduledJob.id] = resolve;
      });
    }

    const screenshotUrl = new URL(name, `https://${CDN_DOMAIN}`).toString();
    return reply.code(200).send({ screenshotUrl });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ error: "Failed to add job to queue" });
  }
});

try {
  await fastify.listen({ port: 3000 });
} catch (e) {
  process.exit(1);
}
