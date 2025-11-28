// import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
// import {Upload} from "@aws-sdk/lib-storage";
// import {v4 as uuidv4} from 'uuid';
// import {CustomError} from "../../../package/errors/customError";
// import {StorageRepository} from "../../domain/storage/repository";
// import {AttachmentParameter} from "../../domain/chat/chat";
// import path from "path";
//
//
// export class S3StorageClass implements StorageRepository {
//     private s3Client: S3Client;
//     private region: string;
//
//     constructor(s3Client: S3Client, region: string) {
//         this.s3Client = s3Client;
//         this.region = region;
//     }
//
//     // async upload(
//     //     file: Express.Multer.File,
//     //     containerName: string, // Ignored in Firebase, as bucket is set at init
//     //     blobName?: string
//     // ): Promise<string> {
//     //     // Generate a blobName if not provided
//     //     const name = blobName || `${uuidv4()}-${file.originalname.replace(/\s/g, "_")}`;
//     //     const destination = path.join(containerName, name);
//     //
//     //     // Upload to Firebase Storage
//     //     await firebaseStorage.file(destination).save(file.buffer, {
//     //         contentType: file.mimetype,
//     //         resumable: false,
//     //         public: true, // Make file public, adjust as needed
//     //     });
//     //
//     //     // Get public URL
//     //     const publicUrl = `https://storage.googleapis.com/${firebaseStorage.name}/${destination}`;
//     //     return publicUrl;
//     // }
// }
//
