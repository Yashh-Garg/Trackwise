import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import upload from "../middleware/upload-middleware.js";
import {
  changePassword,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
} from "../controllers/user.js";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

const router = express.Router();

router.get("/profile", authenticateUser, getUserProfile);
router.put(
  "/profile",
  authenticateUser,
  validateRequest({
    body: z.object({
      name: z.string(),
      profilePicture: z.string().optional(),
    }),
  }),
  updateUserProfile
);

router.post(
  "/upload-avatar",
  authenticateUser,
  upload.single('profilePicture'),
  uploadAvatar
);

router.put(
  "/change-password",
  authenticateUser,
  validateRequest({
    body: z.object({
      currentPassword: z.string(),
      newPassword: z.string(),
      confirmPassword: z.string(),
    }),
  }),
  changePassword
);

export default router;