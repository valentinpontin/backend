import path from 'path';
import multer from 'multer';
import __dirname from "./utils.js"

const storage = (folderName) => multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, `./public/uploads/${folderName}`));
    },
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const uploader = (folderName) => multer({
    storage: storage(folderName),
    onError: (err, next) => {
        next(err);
    }
});

export default uploader;