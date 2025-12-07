import { Router } from 'express';
import { getOrCreateConversation, getUserConversations } from "../controllers/conversationController";
import { authMiddleware } from "../middleware/authMiddlware";

const router = Router();

router.post("/get-or-create",authMiddleware, getOrCreateConversation);
router.post("/",authMiddleware, getUserConversations);

export default router;
