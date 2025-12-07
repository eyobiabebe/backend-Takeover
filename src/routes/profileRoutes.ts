import { Router } from 'express';
import { getOrCreateProfile, updateProfile, uploadProfileImage, userProfile } from '../controllers/profileController';
import uploadProfile from '../middleware/uploadProfile';
import { authMiddleware } from "../middleware/authMiddlware";

const router = Router();

router.post('/upload-image', uploadProfile.single("profileImage"),authMiddleware, uploadProfileImage);

router.post('/', authMiddleware, getOrCreateProfile);
router.post('/userProfile', authMiddleware, userProfile);
router.put('/',authMiddleware, updateProfile);

export default router;
