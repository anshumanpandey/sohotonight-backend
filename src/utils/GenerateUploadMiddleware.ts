import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import GetMulterCloudnaryStorage, { UploadMiddlewareParams } from './GetMulterCloudnaryStorage';

export default (params: UploadMiddlewareParams) => {
    const fieldSize = 500 * 1024 * 1024

    let storage = GetMulterCloudnaryStorage(params)

    return multer({ storage, limits: { fieldSize } })
}