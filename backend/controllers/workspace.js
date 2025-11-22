import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import User from "../models/user.js";
import WorkspaceInvite from "../models/workspace-invite.js";
import Task from "../models/task.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/send-email.js";
import { recordActivity } from "../libs/index.js";
import mongoose from "mongoose";
// export const getWorkspaceDetails = async (req, res) => {
//   const { id } = req.params;
//   const userId = req.user._id; // assuming you have authentication middleware

//   const workspace = await Workspace.findById(id)
//     .populate("owner")
//     .populate("members.user")
//     .populate("projects");

//   if (!workspace) {
//     return res.status(404).json({ message: "Workspace not found" });
//   }

//   const currentUserRole =
//     workspace.members.find((m) => m.user._id.toString() === userId.toString())
//       ?.role || null;

//   res.json({
//     ...workspace.toObject(),
//     currentUserRole,
//   });
// };

const removeWorkspaceMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const userId = req.user._id; // From auth middleware

    if (
      !mongoose.Types.ObjectId.isValid(workspaceId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid workspace or member ID" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Only owner or admin can remove
    const currentUserRole = workspace.members.find(
      (m) => m.user.toString() === userId.toString()
    )?.role;

    if (!["owner", "admin"].includes(currentUserRole)) {
      return res
        .status(403)
        .json({ message: "Not authorized to remove members" });
    }

    // Prevent removing owner
    const memberToRemove = workspace.members.find(
      (m) => m.user.toString() === memberId.toString()
    );
    if (memberToRemove?.role === "owner") {
      return res
        .status(400)
        .json({ message: "Cannot remove the workspace owner" });
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== memberId.toString()
    );

    await workspace.save();

    res.status(200).json({ message: "Member removed successfully", workspace });
  } catch (error) {
    console.error("Error removing workspace member:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(workspaces);
  } catch (error) {
    console.error("Error getting workspaces:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId).populate(
      "members.user",
      "name email profilePicture"
    );

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    res.status(200).json(workspace);
  } catch (error) {
    console.error("Error getting workspace details:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const projects = await Project.find({
      workspace: workspaceId,
      isArchived: false,
      members: { $elemMatch: { user: req.user._id } },
    })
      .populate("tasks", "status")
      .sort({ createdAt: -1 });

    res.status(200).json({ projects, workspace });
  } catch (error) {
    console.error("Error getting workspace projects:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Add validation for workspaceId
    if (!workspaceId || workspaceId === "null" || workspaceId === "undefined") {
      return res.status(400).json({
        message: "Invalid workspace ID provided",
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const [totalProjects, projects] = await Promise.all([
      Project.countDocuments({ workspace: workspaceId }),
      Project.find({ workspace: workspaceId })
        .populate(
          "tasks",
          "title status dueDate project updatedAt isArchived priority"
        )
        .sort({ createdAt: -1 }),
    ]);

    const totalTasks = projects.reduce((acc, project) => {
      return acc + project.tasks.length;
    }, 0);

    const totalProjectInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;

    const totalTaskCompleted = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "Done").length
      );
    }, 0);

    const totalTaskToDo = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "To Do").length
      );
    }, 0);

    const totalTaskInProgress = projects.reduce((acc, project) => {
      return (
        acc +
        project.tasks.filter((task) => task.status === "In Progress").length
      );
    }, 0);

    const tasks = projects.flatMap((project) => project.tasks);

    // get upcoming task in next 7 days
    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, todo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, todo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, todo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, todo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, todo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, todo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, todo: 0 },
    ];

    // get last 7 days tasks date
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // Fixed: Use for...of instead of for...in
    for (const project of projects) {
      for (const task of project.tasks) {
        const taskDate = new Date(task.updatedAt);

        const dayInDate = last7Days.findIndex(
          (date) =>
            date.getDate() === taskDate.getDate() &&
            date.getMonth() === taskDate.getMonth() &&
            date.getFullYear() === taskDate.getFullYear()
        );

        if (dayInDate !== -1) {
          const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
            weekday: "short",
          });

          const dayData = taskTrendsData.find((day) => day.name === dayName);

          if (dayData) {
            switch (task.status) {
              case "Done":
                dayData.completed++;
                break;
              case "In Progress":
                dayData.inProgress++;
                break;
              case "To Do":
                dayData.todo++;
                break;
            }
          }
        }
      }
    }

    // get project status distribution
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];

    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    // Task priority distribution
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    const workspaceProductivityData = [];

    for (const project of projects) {
      const projectTask = tasks.filter(
        (task) => task.project.toString() === project._id.toString()
      );

      const completedTask = projectTask.filter(
        (task) => task.status === "Done" && task.isArchived === false
      );

      workspaceProductivityData.push({
        name: project.title,
        completed: completedTask.length,
        total: projectTask.length,
      });
    }

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    res.status(200).json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    });
  } catch (error) {
    console.error("Error getting workspace stats:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const inviteUserToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({
        message: "You are not authorized to invite members to this workspace",
      });
    }

    // Check if user exists
    let existingUser = await User.findOne({ email });
    let userId = existingUser?._id;

    // If user doesn't exist, we'll create the invite without a user reference
    // The user will be associated when they sign up with this email
    if (!existingUser) {
      console.log(`User with email ${email} not found. Creating invite without user reference.`);
      
      // Delete any existing invites for this email (expired or not) to allow re-inviting
      await WorkspaceInvite.deleteMany({
        email: email,
        workspaceId: workspaceId,
      });
    } else {
      // Check if user is already a member
      const isMember = workspace.members.some(
        (member) => member.user.toString() === existingUser._id.toString()
      );

      if (isMember) {
        return res.status(400).json({
          message: "User already a member of this workspace",
        });
      }

      // Delete any existing invites for this user or email to allow re-inviting
      await WorkspaceInvite.deleteMany({
        $or: [
          { user: existingUser._id, workspaceId: workspaceId },
          { email: email, workspaceId: workspaceId },
        ],
      });
    }

    // Generate invite token
    const inviteToken = jwt.sign(
      {
        email: email,
        workspaceId: workspaceId,
        role: role || "member",
        ...(userId && { user: userId }),
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create invite - if user exists, reference them; if not, store email for later
    await WorkspaceInvite.create({
      ...(userId && { user: userId }),
      email: email, // Store email so we can match it when user signs up
      workspaceId: workspaceId,
      token: inviteToken,
      role: role || "member",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;

    const emailContent = `
      <p>You have been invited to join ${workspace.name} workspace</p>
      <p>Click here to join: <a href="${invitationLink}">${invitationLink}</a></p>
    `;

    await sendEmail(
      email,
      "You have been invited to join a workspace",
      emailContent
    );

    res.status(200).json({
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Error inviting user to workspace:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptGenerateInvite = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "You are already a member of this workspace",
      });
    }

    workspace.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await recordActivity(
      req.user._id,
      "joined_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Joined ${workspace.name} workspace`,
      }
    );

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting generate invite:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;
    const currentUser = req.user; // User from auth middleware

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user: tokenUserId, email: tokenEmail, workspaceId, role } = decoded;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Determine which user ID to use
    // If token has user ID, use it; otherwise use the current authenticated user
    const userId = tokenUserId || currentUser._id;

    // Check if user is already a member
    const isMember = workspace.members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    // Find invite by token email (if present), user ID, or current user email
    const inviteQuery = {
      $or: [
        ...(tokenEmail ? [{ email: tokenEmail, workspaceId: workspaceId }] : []),
        { user: userId, workspaceId: workspaceId },
        { email: currentUser.email, workspaceId: workspaceId },
      ],
    };
    
    const inviteInfo = await WorkspaceInvite.findOne(inviteQuery);

    if (!inviteInfo) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    // If invite has an email (invited to non-existing user), verify current user's email matches
    // This ensures the user signed up with the email that was invited
    if (inviteInfo.email && inviteInfo.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      return res.status(403).json({
        message: "This invitation is for a different email address. Please sign in with the email address that was invited.",
      });
    }

    if (inviteInfo.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Invitation has expired",
      });
    }

    // Update invite with user ID if it was created for a non-existing user
    if (!inviteInfo.user && userId) {
      inviteInfo.user = userId;
      await inviteInfo.save();
    }

    workspace.members.push({
      user: userId,
      role: role || inviteInfo.role || "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await Promise.all([
      WorkspaceInvite.deleteOne({ _id: inviteInfo._id }),
      recordActivity(userId, "joined_workspace", "Workspace", workspaceId, {
        description: `Joined ${workspace.name} workspace`,
      }),
    ]);

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting invite by token:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// NEW FUNCTIONS FOR SETTINGS PAGE
const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, color } = req.body;

    // Validate workspaceId
    if (!workspaceId || workspaceId === "null" || workspaceId === "undefined") {
      return res.status(400).json({
        message: "Invalid workspace ID provided",
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Check if user is owner or admin
    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({
        message: "You are not authorized to update this workspace",
      });
    }

    // Update workspace
    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        name,
        description,
        color,
      },
      { new: true }
    );

    // Record activity
    await recordActivity(
      req.user._id,
      "updated_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Updated ${workspace.name} workspace settings`,
      }
    );

    res.status(200).json({
      message: "Workspace updated successfully",
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Validate workspaceId
    if (!workspaceId || workspaceId === "null" || workspaceId === "undefined") {
      return res.status(400).json({
        message: "Invalid workspace ID provided",
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Check if user is owner (only owner can delete workspace)
    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || userMemberInfo.role !== "owner") {
      return res.status(403).json({
        message: "Only workspace owner can delete this workspace",
      });
    }

    // Delete associated data
    await Promise.all([
      // Delete all projects in the workspace
      Project.deleteMany({ workspace: workspaceId }),
      // Delete all tasks in the workspace projects
      Task.deleteMany({
        project: {
          $in: await Project.find({ workspace: workspaceId }).select("_id"),
        },
      }),
      // Delete all workspace invites
      WorkspaceInvite.deleteMany({ workspaceId: workspaceId }),
      // Delete the workspace itself
      Workspace.findByIdAndDelete(workspaceId),
    ]);

    // Record activity
    await recordActivity(
      req.user._id,
      "deleted_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Deleted ${workspace.name} workspace`,
      }
    );

    res.status(200).json({
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
  inviteUserToWorkspace,
  acceptGenerateInvite,
  acceptInviteByToken,
  updateWorkspace,
  deleteWorkspace,
  removeWorkspaceMember,
};
