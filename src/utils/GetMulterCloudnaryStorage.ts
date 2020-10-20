import express = require('express');
import { v2 } from 'cloudinary';
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadMiddlewareParams = { type?: "image" | "video", folderPath?: "videos" | "pictures", resolveDestination?: (req: express.Request, file: Express.Multer.File) => void }
export default ({ type = 'image', folderPath, resolveDestination }: UploadMiddlewareParams) => {
    const storage = new CloudinaryStorage({
        cloudinary: v2,
        params: {
            //@ts-expect-error
            resource_type: type,
            folder: resolveDestination ? (req, file) => `soho/${resolveDestination(req, file)}`: `soho/${folderPath}`,
            format: async (req, file) => extname(file.originalname).replace('.', ""), // supports promises as well
            public_id: (req, file) => `${uuidv4()}-${Date.now()}`,
        },
    });

    return storage
}