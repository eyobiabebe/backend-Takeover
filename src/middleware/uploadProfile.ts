// import multer from "multer";
// import path from "path";

// // Storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const userUploadPath = path.join(__dirname, "..", "profiles");
//     cb(null, userUploadPath); // Folder to save images
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//   },
// });

// const uploadProfile = multer({ storage });

// export default uploadProfile;
import multer from "multer";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const storage = multer.memoryStorage();

const uploadProfile = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

export default uploadProfile;