import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const BUCKET_NAME = "siteshooter-screenshots";
const AWS_REGION = "eu-west-1";
const s3 = new S3Client({ region: AWS_REGION });

export function doesExist(name) {
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

export function store(name, base64) {
  return s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: name,
      Body: Buffer.from(base64, "base64"),
      ContentType: "image/png",
    })
  );
}
