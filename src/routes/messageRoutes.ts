import { Router } from 'express';
import { sendMessage, getMessagesForConversation } from '../controllers/messageController';
import { authMiddleware } from "../middleware/authMiddlware";
const router = Router();

router.post("/",authMiddleware, sendMessage);
router.post("/:conversationId",authMiddleware, getMessagesForConversation);


export default router;