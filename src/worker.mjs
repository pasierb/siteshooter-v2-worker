import Queue from "bull";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { takeScreenshot } from "./screenshot.mjs";
import { SCREENSHOT_WORKER_QUEUE } from "./queues.mjs";

const BUCKET_NAME = "siteshooter-screenshots";
const AWS_REGION = "eu-west-1";

const s3 = new S3Client({ region: AWS_REGION });
const jobsQueue = new Queue(
  SCREENSHOT_WORKER_QUEUE,
  process.env.REDIS_CONNECTION_STRING
);

console.log("Worker is running...");
jobsQueue.process(async (job, done) => {
  try {
    if (await doesExist(job.data.name)) {
      console.log(`Screenshot ${job.data.name} already exists`);
      return done();
    }

    const base64 = await takeScreenshot(job.data);
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: job.data.name,
        Body: Buffer.from(base64, "base64"),
        ContentType: "image/png",
      })
    );
    done();
  } catch (error) {
    console.error(error);
    done(error);
  }
});

function doesExist(name) {
  return s3
    .send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: name,
      })
    )
    .then(() => true)
    .catch(() => false);
}
