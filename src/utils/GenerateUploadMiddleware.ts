import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

export default ({ folderName }: { folderName: string }) => {
    const fieldSize = 500 * 1024 * 1024

    let storage = multer.diskStorage({
        destination: `${folderName}/`,
        filename: function (req, file, cb) {
            cb(null, `${uuidv4()}-${Date.now()}${extname(file.originalname)}`)
        }
    });

    return multer({ storage, limits: { fieldSize } })
}