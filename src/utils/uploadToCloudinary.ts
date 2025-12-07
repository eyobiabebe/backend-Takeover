import sharp from "sharp";
import cloudinary from "../config/cloudinary";

export const uploadToCloudinary = async (
  buffer: Buffer,
  userId: string,
  section: string
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const compressed = await sharp(buffer)
      .resize({ width: 1200 })
      .webp({ quality: 80 })
      .toBuffer();

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `listings/${userId}/${section}`,
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

/**
 * Delete an image from Cloudinary by URL
 * @param url - the full Cloudinary image URL
 */
export const deleteFromCloudinary = async (url: string) => {
  try {
    // Extract public ID from the URL
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/listings/userId/section/filename.webp
    const parts = url.split("/");
    const folderIndex = parts.findIndex((p) => p === "listings");
    if (folderIndex === -1) throw new Error("Invalid Cloudinary URL");

    // publicId includes everything after "listings/"
    const publicId = parts.slice(folderIndex).join("/").replace(/\.[^/.]+$/, ""); // remove file extension
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    console.log(`Deleted from Cloudinary: ${publicId}`);
  } catch (err) {
    console.error("Failed to delete from Cloudinary:", err);
    throw err;
  }
};
