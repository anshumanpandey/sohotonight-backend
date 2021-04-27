import express = require('express');
import { v4 as uuidv4 } from 'uuid';
import { S3Client, AWS_BUCKET } from './AwsS3Client';
var multerS3 = require('multer-s3-transform')


export type UploadMiddlewareParams = {
    type?: "image" | "video",
    folderPath?: "videos" | "pictures",
    acl?: "private" | "public-read",
    resolveDestination?: (req: express.Request, file: Express.Multer.File) => void
}
export default ({ acl = "private", folderPath, resolveDestination }: UploadMiddlewareParams) => {
    const storage = new multerS3({
        s3: S3Client,
        acl,
        bucket: AWS_BUCKET,
        contentDisposition: 'attachment',
        key: resolveDestination ? (req: any, file: any, cb: any) => cb(null,resolveDestination(req, file)) : (r: any, f: any, cb: any) => {
            const id = uuidv4()
            cb(null, `${folderPath}/${id}.${f.originalname.split('.').pop()}`)
        },
    });

    return storage
}