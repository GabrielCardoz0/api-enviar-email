import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.resolve('.'));
    },

    filename: (req, file, callback) => {
        const time = new Date().getTime();
        callback(null, `${time}_${file.originalname}`);
    }
});


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    fieldSize: 50 * 1024 * 1024,
  }
});


export { upload, storage };