// src/controllers/authController.ts
import { Request, Response } from "express";
import crypto from "crypto";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { generateToken, JWTPayload } from "../utils/generateToken";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { sendEmails } from "../utils/sendEmail";
import { sendResetEmail } from "../utils/mailer";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= REGISTER =================
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) return res.status(400).json({ message: "already registered " ,
      user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      emailVerified: existingUser.emailVerified,
    }});

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationToken,
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;
   await sendEmails({
  to: user.email,
  subject: "Verify Your Email",
  html: `<p>Hello ${user.name},</p>
         <p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
});
    // Instead of sending email, just return the URL for now
    return res.status(201).json({
      id:user.id,
      name: user.name,
      email: user.email,
      message: "Registered successfully. Please verify your email before logging in.",
      verifyUrl, // You can use this URL to send email later
    });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;
  console.log("Token received:", token);

  try {
    const user = await User.findOne({ where: { emailVerificationToken: token.trim() } });

    if (!user) {
      // Check if already verified
      const alreadyVerified = await User.findOne({ where: { emailVerified: true } });
      if (alreadyVerified) {
        return res.json({ message: "Email already verified. You can log in." });
      }
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    return res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("verifyEmail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
export const login = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    console.log(user);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.emailVerified) return res.status(403).json({ message: "Please verify your email before logging in." });

    if (!user.password) return res.status(401).json({ message: "No password set. Please login via Google/Facebook." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const expiresIn = rememberMe ? "7d" : "1h";
    const payload: JWTPayload = { id: user.id, email: user.email };
    const token = generateToken(payload, expiresIn);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,//change to true in production
      sameSite: "none",
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined,
    });

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGOUT =================
export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict" });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



// ================= GOOGLE MOBILE LOGIN =================
export const googleMobileLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload: TokenPayload | undefined = ticket.getPayload();
    if (!payload) return res.status(400).json({ message: "Invalid Google token payload" });

    const email = payload.email;
    const name = payload.name ?? "Google User";
    if (!email) return res.status(400).json({ message: "Google account has no email" });

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: null,
        emailVerified: true,
      });
    }

    const jwtToken = generateToken({ id: user.id, email: user.email }, "7d");
    res.cookie("token", jwtToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 24 * 60 * 60 * 1000 });

    return res.json({
      token: jwtToken,
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("googleMobileLogin error:", error);
    return res.status(401).json({ message: "Invalid Google token" });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req: Request, res: Response) => {

  const { email, platform  } = req.body;

  console.log("reaching forgot endpoint");

  console.log("incomming email:",email);
  try {
    const user = await User.findOne({ where: { email } });

    console.log("user found :",user);

    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`; // Web

    await sendResetEmail(user.email, resetUrl);

    return res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= GET PROFILE =================
export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await User.findByPk(userId, { attributes: { exclude: ["password"] } });

    if (!user) return res.status(404).json({ message: "Not found" });

    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};