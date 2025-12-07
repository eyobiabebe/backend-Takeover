import { Router } from 'express';
import { createListing, deleteListing, getAllListings,updateListing, getListingById, getMyListings, getMyTakeovers,
    getListingApplicants,
    completeListing,
    draftListing,
    
  } from '../controllers/listingController';
import upload from '../middleware/uploads';
import { authMiddleware } from "../middleware/authMiddlware";

const router = Router();

router.get('/', getAllListings);

router.post('/', upload.any(), authMiddleware ,createListing);
router.post('/draft', upload.any(), authMiddleware , draftListing);
router.post('/complete', authMiddleware ,completeListing);

router.get("/mylisting/:userId",authMiddleware , getMyListings); 
router.get("/mytakeovers/:userId",authMiddleware , getMyTakeovers);
router.get("/:id", getListingById);

router.delete("/:id",authMiddleware , deleteListing);

router.get("/applicants/:leaseId",authMiddleware , getListingApplicants); 

router.put("/:id", upload.any(), authMiddleware, updateListing);

export default router;
