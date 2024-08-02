import "dotenv/config";
import Queue from "bull";
import { takeScreenshot } from "./screenshot.mjs";
import { SCREENSHOT_WORKER_QUEUE } from "./queues.mjs";
import { doesExist, store } from "./store.mjs";

const jobsQueue = new Queue(
  SCREENSHOT_WORKER_QUEUE,
  process.env.REDIS_CONNECTION_STRING
);

console.log("Worker is running...");
await jobsQueue.process(async (job, done) => {
  console.log(`Processing ${JSON.stringify(job.data)}`);
  try {
    if (await doesExist(job.data.name)) {
      console.log(`Screenshot ${job.data.name} already exists`);
      return await done(null, { exists: true });
    }

    const base64 = await takeScreenshot(job.data);
    await store(job.data.name, base64);
    return done();
  } catch (error) {
    console.error(error);
    return done(error);
  }
});
