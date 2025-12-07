import sharp from "sharp";
import cloudinary from "../config/cloudinary";

export const uploadProfileToCloudinary = async (
  buffer: Buffer,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const compressed = await sharp(buffer)
      .resize({ width: 1200 })
      .webp({ quality: 80 })
      .toBuffer();

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `Profile`,
        resource_type: "image",
        format: "webp",
      },
      (error:any, result:any) => {
        if (error) reject(error);
        else resolve(result?.secure_url || "");
      }
    );

    uploadStream.end(compressed);
  });
};
