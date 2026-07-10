const multer = require('multer');
const { HttpError } = require('../utils/httpError');

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new HttpError(400, 'Solo se permiten imagenes JPEG, PNG o WEBP'));
    }
    cb(null, true);
  },
});

function uploadSingle(fieldName = 'file') {
  return upload.single(fieldName);
}

module.exports = { uploadSingle };
