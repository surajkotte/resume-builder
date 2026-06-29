import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";

const requiredEnv = [
  "AMAZON_S3_ENDPOINT",
  "AMAZON_S3_REGION",
  "AMAZON_S3_ACCESS_KEY",
  "AMAZON_S3_SECRET_KEY",
  "AMAZON_S3_BUCKET_NAME",
];

for (const env of requiredEnv) {
  if (!process.env[env]) {
    throw new Error(`CRITICAL: Missing required environment variable: ${env}`);
  }
}

// Helper function to guarantee bucket existence
async function ensureBucketExists(s3Client: S3Client, bucketName: string) {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (error: any) {
    // 404 means the bucket doesn't exist yet
    if (error.$metadata?.httpStatusCode === 404) {
      console.log(`Bucket '${bucketName}' missing. Creating automatically...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    } else {
      throw error;
    }
  }
}

export const s3 = new S3Client({
  endpoint: process.env.AMAZON_S3_ENDPOINT!,
  region: process.env.AMAZON_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AMAZON_S3_ACCESS_KEY!,
    secretAccessKey: process.env.AMAZON_S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

interface UploadResponse {
  internalPath: string;
  httpUrl: string;
}

export const uploadToS3 = async (
  fileName: string,
  fileContent: Buffer | Uint8Array | Blob | string,
  fileType: string,
): Promise<UploadResponse> => {
  try {
    const bucketName = process.env.AMAZON_S3_BUCKET_NAME!;
    await ensureBucketExists(s3, bucketName);
    const params = {
      Bucket: process.env.AMAZON_S3_BUCKET_NAME!,
      Key: fileName,
      Body: fileContent,
      ContentType: fileType,
    };

    console.log(params);

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const internalPath = fileName;
    const httpUrl = `${process.env.AMAZON_S3_ENDPOINT}/${process.env.AMAZON_S3_BUCKET_NAME}/${fileName}`;

    return { internalPath, httpUrl };
  } catch (err) {
    console.error("Error uploading file to S3:", err);
    throw new Error("Failed to persist file to cloud storage.");
  }
};

export interface GetBase64Response {
  messageType: "S" | "E";
  data?: string;
  message?: string;
}

export const getBase64FromS3 = async (
  fileKey: string,
): Promise<GetBase64Response> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AMAZON_S3_BUCKET_NAME!,
      Key: fileKey,
    });

    const response = await s3.send(command);

    if (!response.Body) {
      throw new Error("Received empty data body from S3 storage.");
    }

    const byteArray = await response.Body.transformToByteArray();
    const buffer = Buffer.from(byteArray);
    const base64String = buffer.toString("base64");

    return { messageType: "S", data: base64String };
  } catch (error: any) {
    console.error("S3 Download Error:", error);
    return {
      messageType: "E",
      message: error?.message || "Error fetching file from S3",
    };
  }
};
