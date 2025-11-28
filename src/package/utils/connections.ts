import mongoose from "mongoose";
import {AWSCredentials} from "../configs/environment";
import {S3Client} from "@aws-sdk/client-s3";

export const mongoClient = async (mongoDBConnectionString: string) => {
    try {
        await mongoose.connect(mongoDBConnectionString);
    } catch (e) {
        console.error(`error connecting to mongo db`,e);
        process.exit(1)
    }
}

export const s3Client = (awsCredentials: AWSCredentials): S3Client => {
    return new S3Client({
        region: awsCredentials.region,
        credentials: {
            accessKeyId: awsCredentials.accessKeyId,
            secretAccessKey: awsCredentials.secretAccessKey,
            sessionToken: awsCredentials.sessionToken
        },
    });
}