import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";
import {v4 as uuidv4} from 'uuid';
import {StorageRepository} from "../../domain/storage/repository";
import {Attachment, IAttachment} from "../../domain/chat/chat";
import {undefined} from "zod";


export class S3StorageClass implements StorageRepository {
    private s3Client: S3Client;
    private region: string;

    constructor(s3Client: S3Client, region: string) {
        this.s3Client = s3Client;
        this.region = region;
    }

    public async upload(file: Express.Multer.File, containerName: string, blobName?: string): Promise<string> {
        const key = blobName || `${uuidv4()}-${file.originalname}`;

        try {
            const parallelUploads3 = new Upload({
                client: this.s3Client,
                params: {
                    Bucket: containerName,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                },
            })

            parallelUploads3.on("httpUploadProgress", (progress) => {
            });

            await parallelUploads3.done();

            const encodedKey = encodeURIComponent(key);
            let objectUrl: string;

            objectUrl = `https://${containerName}.s3.${this.region}.amazonaws.com/${encodedKey}`;

            return objectUrl;

        } catch (error: any) {
            throw new Error(`S3 Upload Failed: ${error.message || 'Unknown S3 error'}`);
        }
    }

    public async uploadAttachments(files: Express.Multer.File[], containerName: string, blobName?: string): Promise<IAttachment[]> {
        try {
            let attachments: IAttachment[] = []
            for await (const file of files) {
                try {
                    const key = blobName || `${uuidv4()}-${file.originalname.replace(/\s/g, '_')}`;

                    const parallelUploads3 = new Upload({
                        client: this.s3Client,
                        params: {
                            Bucket: containerName,
                            Key: key,
                            Body: file.buffer,
                            ContentType: file.mimetype,
                        },
                    })

                    parallelUploads3.on("httpUploadProgress", (progress) => {
                    });

                    await parallelUploads3.done();

                    const encodedKey = encodeURIComponent(key);
                    let objectUrl: string;

                    objectUrl = `https://${containerName}.s3.${this.region}.amazonaws.com/${encodedKey}`;

                    attachments.push({
                        filename: key,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        url: objectUrl,
                    })
                } catch (e) {
                    console.log(e)
                    continue
                }
            }

            return attachments
        } catch (error: any) {
            throw new Error(`S3 Upload Failed: ${error.message || 'Unknown S3 error'}`);
        }
    }

}



