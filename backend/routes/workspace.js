import express from "express";
import { validateRequest } from "zod-express-middleware";
import {
  acceptGenerateInvite,
  acceptInviteByToken,
  createWorkspace,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaces,
  getWorkspaceStats,
  inviteUserToWorkspace,
  updateWorkspace,
  deleteWorkspace,
  removeWorkspaceMember,
} from "../controllers/workspace.js";
import {
  inviteMemberSchema,
  tokenSchema,
  workspaceSchema,
  updateWorkspaceSchema,
} from "../libs/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { z } from "zod";

const router = express.Router();

// Create workspace
router.post(
  "/",
  authMiddleware,
  validateRequest({ body: workspaceSchema }),
  createWorkspace
);

// Accept invite by token
router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptInviteByToken
);

// Invite member to workspace
router.post(
  "/:workspaceId/invite-member",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: inviteMemberSchema,
  }),
  inviteUserToWorkspace
);

// Accept generate invite
router.post(
  "/:workspaceId/accept-generate-invite",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  acceptGenerateInvite
);

// Get all workspaces
router.get("/", authMiddleware, getWorkspaces);

// Get workspace projects (must come before /:workspaceId to avoid route conflicts)
router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);

// Get workspace stats (must come before /:workspaceId to avoid route conflicts)
router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);

// Get workspace details (must come after more specific routes)
router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);

// Update workspace
router.put(
  "/:workspaceId",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: updateWorkspaceSchema,
  }),
  updateWorkspace
);

// Delete workspace
router.delete(
  "/:workspaceId",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  deleteWorkspace
);
// Remove member from workspace

router.delete(
  "/:workspaceId/members/:memberId",
  authMiddleware,
  removeWorkspaceMember
);

export default router;

// import express from "express";
// import { validateRequest } from "zod-express-middleware";
// import {
//   acceptGenerateInvite,
//   acceptInviteByToken,
//   createWorkspace,
//   getWorkspaceDetails,
//   getWorkspaceProjects,
//   getWorkspaces,
//   getWorkspaceStats,
//   inviteUserToWorkspace,
// } from "../controllers/workspace.js";
// import {
//   inviteMemberSchema,
//   tokenSchema,
//   workspaceSchema,
// } from "../libs/validate-schema.js";
// import authMiddleware from "../middleware/auth-middleware.js";
// import { z } from "zod";

// const router = express.Router();

// router.post(
//   "/",
//   authMiddleware,
//   validateRequest({ body: workspaceSchema }),
//   createWorkspace
// );

// router.post(
//   "/accept-invite-token",
//   authMiddleware,
//   validateRequest({ body: tokenSchema }),
//   acceptInviteByToken
// );

// router.post(
//   "/:workspaceId/invite-member",
//   authMiddleware,
//   validateRequest({
//     params: z.object({ workspaceId: z.string() }),
//     body: inviteMemberSchema,
//   }),
//   inviteUserToWorkspace
// );

// router.post(
//   "/:workspaceId/accept-generate-invite",
//   authMiddleware,
//   validateRequest({ params: z.object({ workspaceId: z.string() }) }),
//   acceptGenerateInvite
// );

// router.get("/", authMiddleware, getWorkspaces);

// router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);
// router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);
// router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);

// export default router;
