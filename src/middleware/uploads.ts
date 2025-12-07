// // export default upload;
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const MAX_FILE_SIZE = 2 * 1024 * 1024;

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const userId = req.body.userId;
//     const section = file.fieldname.split("[")[1]?.replace("]", "") || "general";
//     // 👉 extract section name from fieldname like images[Kitchen]
   
//     if (!userId) {
//       return cb(new Error("Missing userId in request body"), "");
//     }

//     const uploadPath = path.join(__dirname, "..", "uploads", userId, section);

//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }

//     cb(null, uploadPath);
//   },

//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${Math.round(
//       Math.random() * 1e9
//     )}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

// const fileFilter = (
//   req: Express.Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback
// ) => {
//   if (file.mimetype.startsWith("image/")) cb(null, true);
//   else cb(new Error("Only image files are allowed."));
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: MAX_FILE_SIZE,
//     files: 50, // more since multiple sections
//   },
// });

// export default upload;

import multer from "multer";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 50,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

export default upload;
