// src/controllers/listingController.ts
import { Request, Response } from "express";
import { Listing } from "../models/Listing";
import fs from "fs";
import path from "path";
import multer from "multer";
import { Takeoverattempts } from "../models/Takeoverattempts";
import { User } from "../models/User";
import { Op } from "sequelize";
import { pushNotification } from '../services/notificationService';
import { UserProfile } from "../models/UserProfile";
import { sendEmail } from "../utils/mailer";
import sharp from "sharp";
import { uploadToCloudinary , deleteFromCloudinary } from "../utils/uploadToCloudinary";


// CREATE listing
export const createListing = async (req: Request, res: Response) => {

  try {
    const userId = req.body.userId; // In real app, get from auth middleware
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      title,
      description,
      monthlyPrice,
      type,
      lat,
      lng,
      location,
      startDate,
      endDate,
      bedrooms,
      bathrooms,
      sqft,
      currentMiles,
      remainingMiles,
      milesPerMonth,
      leasingCompany,
      vin_no,
      saleId,
      incentive,
      landlordInfo
    } = req.body;

    console.log(req.body); 
    

    // Group images by section
    // const files = (req.files as Express.Multer.File[]) || [];
    // const imagesBySection: Record<string, string[]> = {};

    // // 🧠 Convert and compress each uploaded image
    // for (const file of files) {
    //   const section = file.fieldname.split("[")[1]?.replace("]", "") || "general";
    //   const ext = path.extname(file.filename);
    //   const fileNameWithoutExt = path.basename(file.filename, ext);
    //   const webpFileName = `${fileNameWithoutExt}.webp`;
    //   const webpPath = path.join(file.destination, webpFileName);

    //   try {
    //     // compress + convert
    //     await sharp(file.path)
    //       .resize({ width: 1200, withoutEnlargement: true })
    //       .webp({ quality: 80 })
    //       .toFile(webpPath);

    //     // remove original
    //     fs.unlinkSync(file.path);

    //     if (!imagesBySection[section]) imagesBySection[section] = [];
    //     imagesBySection[section].push(`${userId}/${section}/${webpFileName}`);
    //   } catch (err) {
    //     console.error("Sharp conversion failed for", file.filename, err);
    //   }
    // }
    const files = (req.files as Express.Multer.File[]) || [];
    const imagesBySection: Record<string, string[]> = {};

    for (const file of files) {
      const section =
        file.fieldname.split("[")[1]?.replace("]", "") || "general";

      try {
        const imageUrl = await uploadToCloudinary(file.buffer, userId, section);

        if (!imagesBySection[section]) imagesBySection[section] = [];
        imagesBySection[section].push(imageUrl);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    // files.forEach((file) => {
    //   const section = file.fieldname.split("[")[1]?.replace("]", "") || "general";
    //   if (!imagesBySection[section]) imagesBySection[section] = [];
    //   imagesBySection[section].push(`${userId}/${section}/${file.filename}`);
    // });

    // Create listing
    const newListing = await Listing.create({
      userId,
      title,
      description,
      monthlyPrice,
      type,
      lat,
      lng,
      location,
      startDate,
      endDate,
      vin_no: type === "car" ? vin_no : null,
      saleId: type === "car" ? saleId : null,
      bedrooms: type === "apartment" ? bedrooms : null,
      bathrooms: type === "apartment" ? bathrooms : null,
      sqft: type === "apartment" ? sqft : null,
      currentMiles: type === "car" ? currentMiles : null,
      remainingMiles: type === "car" ? remainingMiles : null,
      milesPerMonth: type === "car" ? milesPerMonth : null,
      leasingCompany: type === "car" ? leasingCompany : { name: null, email: null },
      incentive: incentive ? incentive : null,
      images: imagesBySection,
      landlordInfo: landlordInfo || { name: '', email: '', phone: '' }
    });

    res.status(201).json(newListing);
  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create listing", details: error });
    console.log(error);
  }
};

export const draftListing = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId; // In real app, get from auth middleware
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      title,
      description,
      monthlyPrice,
      type,
      lat,
      lng,
      location,
      startDate,
      endDate,
      bedrooms,
      bathrooms,
      sqft,
      currentMiles,
      remainingMiles,
      milesPerMonth,
      leasingCompany,
      vin_no,
      saleId,
      incentive,
      landlordInfo
    } = req.body;

    // Group images by section
    const files = (req.files as Express.Multer.File[]) || [];
    const imagesBySection: Record<string, string[]> = {};

    files.forEach((file) => {
      const section = file.fieldname.split("[")[1]?.replace("]", "") || "general";
      if (!imagesBySection[section]) imagesBySection[section] = [];
      imagesBySection[section].push(`${userId}/${section}/${file.filename}`);
    });

    // Create listing
    const newListing = await Listing.create({
      userId,
      title,
      description,
      monthlyPrice,
      type,
      lat,
      lng,
      location,
      startDate,
      endDate,
      vin_no: type === "car" ? vin_no : null,
      saleId: type === "car" ? saleId : null,
      bedrooms: type === "apartment" ? bedrooms : null,
      bathrooms: type === "apartment" ? bathrooms : null,
      sqft: type === "apartment" ? sqft : null,
      currentMiles: type === "car" ? currentMiles : null,
      remainingMiles: type === "car" ? remainingMiles : null,
      milesPerMonth: type === "car" ? milesPerMonth : null,
      leasingCompany: type === "car" ? leasingCompany : { name: null, email: null },
      incentive: incentive ? incentive : null,
      images: imagesBySection,
      landlordInfo: landlordInfo || { name: null, email: null, phone: null }
    });
    const user = await User.findByPk(userId)
    // 🎯 Send notification to the creator
    await pushNotification({
      recipientId: userId,
      type: "draft_listing", // or you can create a new type like "listing_created"
      title: "Your Listing is saved as a draft",
      message: `Your listing "${title}" has been saved as a draft please pay listing fee and publish your listing.`,
    });

    sendEmail(user?.email || "", "draft_listing", { username: user?.name, title: title })

    res.status(201).json(newListing);
  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create listing", details: error });
    console.log(error);

  }
};

// GET all listings
export const getAllListings = async (_req: Request, res: Response) => {
  try {
    const listings = await Listing.findAll({
      order: [["createdAt", "DESC"]],
      where: { status: "active" }
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listings", details: error });
  }
};

// GET listings by user
export const getMyListings = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const userListings = await Listing.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    const listingsWithTakeovers = await Promise.all(
      userListings.map(async (listing) => {
        const takeoverAttempts = await Takeoverattempts.findAll({
          where: { listingId: listing.id },
        });

        return {
          ...listing.toJSON(),
          takeoverAttempts: takeoverAttempts.length,
        };
      })
    );

    res.json(listingsWithTakeovers);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch user listings",
      details: error instanceof Error ? error.message : error,
    });
  }
};

// GET my takeovers
export const getMyTakeovers = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const userTakeovers = await Takeoverattempts.findAll({
      where: { userId: userId },
      order: [["createdAt", "DESC"]],
    });

    const fullData = await Promise.all(
      userTakeovers.map(async (takeover) => {
        const listing = await Listing.findByPk(takeover.listingId);

        return {
          ...takeover.toJSON(),
          listing: listing ? listing.toJSON() : null,
        };
      })
    );

    // Optional: filter out any listings that are no longer active if needed
    const filteredData = fullData.filter((t) => t.listing);

    res.json(filteredData);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch user takeovers",
      details: error instanceof Error ? error.message : error,
    });
  }
};

// GET single listing by ID
export const getListingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByPk(id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listing", details: error });
  }
};

// DELETE listing
export const deleteListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id; // from authMiddleware

  try {
    const listing = await Listing.findByPk(id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Check ownership
    if (listing.userId !== userId) {
      return res.status(403).json({ error: "You are not allowed to delete this listing" });
    }

    // Delete images from Cloudinary
    const imagesBySection = listing.images || {};
    for (const section in imagesBySection) {
      for (const url of imagesBySection[section]) {
        try {
          await deleteFromCloudinary(url); // your Cloudinary utility
        } catch (err) {
          console.warn(`Failed to delete image from Cloudinary: ${url}`, err);
        }
      }
    }

    // Delete listing
    await listing.destroy();

    res.json({ message: "Listing deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete listing", details: error });
  }
};


// UPDATE listing
export const updateListing = async (req: Request, res: Response) => {
  try {
    const listingId = req.params.id;
    const listing = await Listing.findByPk(listingId);

    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const userId = req.body.userId;
    const {
      title,
      description,
      monthlyPrice,
      type,
      lat,
      lng,
      location,
      startDate,
      endDate,
      bedrooms,
      bathrooms,
      sqft,
      currentMiles,
      remainingMiles,
      milesPerMonth,
      leasingCompany,
      vin_no,
      saleId,
      incentive,
      landlordInfo,
      deletedImages, // should be sent as { "Living Room": [url1, url2], ... }
    } = req.body;

    // Start with existing images
    const imagesBySection: Record<string, string[]> = { ...listing.images };
    console.log(imagesBySection);

    // Remove deleted images
    if (deletedImages) {
      Object.keys(deletedImages).forEach((section) => {
        if (imagesBySection[section]) {
          imagesBySection[section] = imagesBySection[section].filter(
            (img) => !deletedImages[section].includes(img)
          );
        }
      });
    }

    // Upload new files
    const files = (req.files as Express.Multer.File[]) || [];
    for (const file of files) {
      const section = file.fieldname.split("[")[1]?.replace("]", "") || "general";
      const imageUrl = await uploadToCloudinary(file.buffer, userId, section);
      console.log(imageUrl);
      if (!imagesBySection[section]) imagesBySection[section] = [];
      imagesBySection[section].push(imageUrl);
    }

    // Update listing
    await listing.update({
      title,
      description,
      monthlyPrice,
      type,
      lat,
      lng,
      location,
      startDate,
      endDate,
      vin_no: type === "car" ? vin_no : null,
      saleId: type === "car" ? saleId : null,
      bedrooms: type === "apartment" ? bedrooms : null,
      bathrooms: type === "apartment" ? bathrooms : null,
      sqft: type === "apartment" ? sqft : null,
      currentMiles: type === "car" ? currentMiles : null,
      remainingMiles: type === "car" ? remainingMiles : null,
      milesPerMonth: type === "car" ? milesPerMonth : null,
      leasingCompany: type === "car" ? leasingCompany : { name: null, email: null },
      incentive: incentive || null,
      images: imagesBySection,
      landlordInfo: landlordInfo || { name: '', email: '', phone: '' },
    });

    res.status(200).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update listing", details: err });
  }
};

export const getListingApplicants = async (req: Request, res: Response) => {
  const { leaseId } = req.params;

  try {
    let applicants = [];
    const raw_applicants = await Takeoverattempts.findAll({
      where: { listingId: leaseId },
      include: [{ model: User, attributes: ["id", "name", "email", "image"] },
        // { model: UserProfile, attributes: ["employmentStatus", "currentAddress"] }
      ],
    });

    for (const attempt of raw_applicants) {
      const userProfile = await UserProfile.findOne({ where: { userId: attempt.userId } });

      applicants.push({
        ...attempt.toJSON(),
        UserProfile: userProfile ? userProfile.toJSON() : null,
      });
    }

    res.json(applicants);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch applicants",
      details: error instanceof Error ? error.message : error,
    });
  }
};

export const completeListing = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.body;
    const listing = await Listing.findByPk(listingId);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Mark the listing as complete
    listing.status = "completed";
    await listing.save();

    res.status(200).json({ listing });
  } catch (error) {
    res.status(500).json({ error: "Failed to complete listing", details: error });
  }
};
