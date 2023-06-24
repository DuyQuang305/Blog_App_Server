const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (file.mimetype == 'image/png' || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            callback(null, true)
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
})

module.exports = upload;