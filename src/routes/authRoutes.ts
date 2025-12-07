// src/routes/authRoutes.ts
import express from "express";
import * as authController from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddlware";

const router = express.Router();

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/google-mobile", authController.googleMobileLogin);

router.get("/verify-email/:token", authController.verifyEmail);

router.get("/me", authMiddleware, authController.getProfile);


// Forgot / Reset
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);


export default router;