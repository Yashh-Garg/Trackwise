import express from "express";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../controllers/notification.js";
import authMiddleware from "../middleware/auth-middleware.js"; // adjust if needed

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.put("/mark-as-read/:id", markAsRead);
router.put("/mark-all-as-read", markAllAsRead);
router.delete("/:id", deleteNotification);

export default router;
