import multer from "multer";
import path from "path";

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder to save images
  },
//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + "-" + file.originalname;
//     cb(null, uniqueName);
//   },
// });
filename: function (req, file, cb) {
  const cleanName = file.originalname.replace(/\s+/g, "-"); // Replace spaces
  const uniqueName = `${Date.now()}-${cleanName}`;
  cb(null, uniqueName);
}
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb("Only images are allowed");
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
