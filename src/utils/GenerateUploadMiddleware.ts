import multer from 'multer';
import GetMulterCloudnaryStorage, { UploadMiddlewareParams } from './GetMulterCloudnaryStorage';

export default (params: UploadMiddlewareParams) => {
    const fieldSize = 500 * 1024 * 1024

    let storage = GetMulterCloudnaryStorage(params)

    return multer({ storage, limits: { fieldSize } })
}