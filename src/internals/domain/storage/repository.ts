import {Attachment, IAttachment} from "../chat/chat";

export interface StorageRepository {
    upload: (file: Express.Multer.File, containerName: string, blobName?: string) => Promise<string>
    uploadAttachments: (files: Express.Multer.File[], containerName: string, blobName?: string) => Promise<IAttachment[]>
}