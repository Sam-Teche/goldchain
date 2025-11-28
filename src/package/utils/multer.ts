import multer, {Multer} from 'multer';
import path from 'path';
import {BadRequestError} from "../errors/customError";

// Common MIME types for attachments
const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    // Video
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/mp4',
    // Other (archives, code, etc)
    'application/zip', 'application/x-rar-compressed', 'application/json', 'text/csv'
];

export class MulterConfig {
    size: number;
    multer: Multer;

    constructor(size = 20 * 1024 * 1024) { // Default: 20MB
        this.size = size;

        this.multer = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: this.size
            },
            fileFilter: function (req, file, callback) {
                if (allowedMimeTypes.includes(file.mimetype)) {
                    callback(null, true);
                } else {
                    callback(new BadRequestError('File type not allowed.'));
                }
            }

        });
    }
}
