import { Request, Response } from "express";
import { Takeoverattempts } from "../models/Takeoverattempts";
import { Listing } from "../models/Listing";
import { pushNotification } from "../services/notificationService";
import { Op } from "sequelize";
import { sendEmail } from "../utils/mailer";
import { User } from "../models/User";


// CREATE listing
export const createTakover = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId; // In real app, get from auth middleware
    const listingId = req.body.listingId;

    console.log(userId, listingId);

    if (!userId || !listingId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Create listing
    const newAttempt = await Takeoverattempts.create(req.body);

    res.status(201).json(newAttempt);
  } catch (error) {
    res.status(500).json({ error: "Failed to create listing", details: error });
    console.log("abdi errr")
  }
};

// Get takeover by ID
export const getTakeoverById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const takeover = await Takeoverattempts.findByPk(id);
    if (!takeover) return res.status(404).json({ error: "Takeover not found" });

    const listing = await Listing.findByPk(takeover.listingId);

    const fullData = {
      ...takeover.toJSON(),
      listing: listing ? listing.toJSON() : null,
    };

    res.json(fullData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch takeover", details: error });
  }
};

// Get takeover by ID
export const findTakeover = async (req: Request, res: Response) => {
  const { listingId, userId } = req.body;

  try {

    const takeover = await Takeoverattempts.findOne({ where: { userId: userId, listingId: listingId } });
    if (!takeover) {
      const newAttempt = await Takeoverattempts.create(req.body);
      res.json(newAttempt);
    } else {
      res.json(takeover);
    }

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch takeover", details: error });
  }
};

// Proceed with takeover
export const proceedTakeover = async (req: Request, res: Response) => {
  const { leaseId, userId } = req.body; // takeover attempt ID

  try {
    const takeover = await Takeoverattempts.findOne({ where: { listingId: leaseId, userId: userId } });
    if (!takeover) return res.status(404).json({ error: "Takeover not found" });

    // Proceed with the takeover process
    // ...
    takeover.status = "proceeding";
    await takeover.save();

    const lease: any = Listing.findByPk(leaseId)

    await pushNotification({
      recipientId: userId,
      type: "takeover_applied", // or you can create a new type like "listing_created"
      title: "Takeover Proceeded Successfully",
      message: `Congratulation You have proceeded the lease ${lease.title} successfully, waitt for acceptance.`,
      data: { listingId: leaseId }
    });

    res.status(200).json({ message: "Takeover in progress", takeover });
  } catch (error) {
    res.status(500).json({ error: "Failed to proceed with takeover", details: error });
  }
};

export const acceptListing = async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log(id);

  try {
    const takeover = await Takeoverattempts.findOne({
      where: { id: id, status: "proceeding" },
    });

    if (!takeover) return res.status(404).json({ error: "Takeover not found" });

    takeover.status = "accepted";
    await takeover.save();

    // Reject other takeovers for the same listing
    await Takeoverattempts.update(
      { status: "rejected" },
      { where: { listingId: takeover.listingId, id: { [Op.ne]: takeover.id } } }
    );

    const listing = await Listing.findByPk(takeover.listingId);

    if (!listing) return res.status(404).json({ error: "Listing not found" });

    listing.status = "archived";
    await listing.save();

    // for the tenant
    await pushNotification({
      recipientId: listing.userId,
      type: "takeover_accepted", // or you can create a new type like "listing_created"
      title: "Takeover Seaker accepted Successfully",
      message: `Congratulation You have accepted a takeover seaker successfully.`,
    });

    const tenant_email = await User.findByPk(listing.userId)
    const takeoverer_email = await User.findByPk(takeover.userId)

    console.log("tenant_email: ", tenant_email?.email, "takeoverer_email: ", takeoverer_email?.email);
    
    sendEmail(tenant_email?.email || "", "accepted_tenant", {
      lessee: tenant_email?.name, lessor: takeoverer_email?.name, address: listing.location, startDate: listing.startDate, endDate: listing.endDate, rent: listing.monthlyPrice,
      title: listing.title,
    });

    // for the landlord
    sendEmail(listing.landlordInfo.email || "", "accepted_landlord", {
      lessee: tenant_email?.name, lessor: takeoverer_email?.name, address: listing.location, startDate: listing.startDate, endDate: listing.endDate, rent: listing.monthlyPrice,
      title: listing.title,
    });

    // for the takeover seaker
    await pushNotification({
      recipientId: takeover.userId,
      type: "takeover_accepted", // or you can create a new type like "listing_created"
      title: "Takeover accepted Successfully",
      message: `Congratulation You have been accepted by the tenant successfully.`,
    });

    sendEmail(takeoverer_email?.email || "", "accepted_takeoverer", {
      lessee: tenant_email?.name, lessor: takeoverer_email?.name, address: listing.location, startDate: listing.startDate, endDate: listing.endDate, rent: listing.monthlyPrice,
      title: listing.title,
    });
 
    res.json({
      listing: listing ? listing.toJSON() : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to accept takeover", details: error });
  }
};

// Reject a takeover
export const rejectListing = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const takeover = await Takeoverattempts.findByPk(id);
    if (!takeover) return res.status(404).json({ error: "Takeover not found" });

    takeover.status = "rejected";
    await takeover.save();

    await pushNotification({
      recipientId: takeover.userId,
      type: "takeover_applied", // or you can create a new type like "listing_created"
      title: "Your Takeover has been rejected",
      message: `Unfortunately you have been rejected, try another leases. <a href="http://localhost:5173/leaseLists">Exlplore</a>`,
      data: { listingId: takeover.listingId }
    });

    res.json({ message: "Takeover rejected successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject takeover", details: error });
  }
}; 
