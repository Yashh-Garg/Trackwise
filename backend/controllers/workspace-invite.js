// controllers/workspace-invite.js
import WorkspaceInvite from "../models/workspace-invite.js";
import Workspace from "../models/workspace.js";
import User from "../models/user.js";
import NotificationService from "../libs/notification-service.js";
import { nanoid } from 'nanoid';

// Create a workspace invite
export const createWorkspaceInvite = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role = 'member' } = req.body;
    const invitedBy = req.user._id;

    // Check if workspace exists and user has permission
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is owner or admin
    const userMember = workspace.members.find(member => 
      member.user.toString() === invitedBy.toString()
    );
    
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to invite members'
      });
    }

    // Find the user to invite
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const isAlreadyMember = workspace.members.some(member => 
      member.user.toString() === invitedUser._id.toString()
    );
    
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this workspace'
      });
    }

    // Check if there's already a pending invite (using your model structure)
    const existingInvite = await WorkspaceInvite.findOne({
      workspaceId: workspaceId,
      user: invitedUser._id,
      expiresAt: { $gt: new Date() }
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'User already has a pending invite to this workspace'
      });
    }

    // Create the invite (using your model structure)
    const invite = new WorkspaceInvite({
      workspaceId: workspaceId,
      user: invitedUser._id,
      role,
      token: nanoid(32),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    await invite.save();

    // Create notification
    await NotificationService.createWorkspaceInviteNotification(
      invite._id,
      invitedUser._id,
      req.user.name,
      workspace.name
    );

    res.status(201).json({
      success: true,
      message: 'Workspace invite sent successfully',
      data: {
        inviteId: invite._id,
        email: invitedUser.email,
        role,
        token: invite.token
      }
    });
  } catch (error) {
    console.error('Error creating workspace invite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create workspace invite',
      error: error.message
    });
  }
};

// Accept workspace invite
export const acceptWorkspaceInvite = async (req, res) => {
  try {
    const { workspaceId, inviteId } = req.params;
    const userId = req.user._id;

    // Find the invite (using your model structure)
    const invite = await WorkspaceInvite.findOne({
      _id: inviteId,
      workspaceId: workspaceId,
      user: userId,
      expiresAt: { $gt: new Date() }
    }).populate('workspaceId');

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found or has expired'
      });
    }

    // Add user to workspace
    const workspace = await Workspace.findById(workspaceId);
    
    // Check if user is already a member (edge case)
    const isAlreadyMember = workspace.members.some(member => 
      member.user.toString() === userId.toString()
    );
    
    if (isAlreadyMember) {
      // Delete the invite since user is already a member
      await WorkspaceInvite.findByIdAndDelete(inviteId);
      
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this workspace'
      });
    }

    // Add user to workspace members
    workspace.members.push({
      user: userId,
      role: invite.role,
      joinedAt: new Date()
    });

    await workspace.save();

    // Delete the invite after acceptance
    await WorkspaceInvite.findByIdAndDelete(inviteId);

    // Notify workspace members about new member
    const workspaceMembers = workspace.members
      .filter(member => member.user.toString() !== userId.toString())
      .map(member => member.user);

    for (const memberId of workspaceMembers) {
      await NotificationService.createMemberJoinedNotification(
        workspaceId,
        memberId,
        req.user.name,
        workspace.name
      );
    }

    res.status(200).json({
      success: true,
      message: 'Workspace invite accepted successfully',
      data: {
        workspace: {
          id: workspace._id,
          name: workspace.name,
          role: invite.role
        }
      }
    });
  } catch (error) {
    console.error('Error accepting workspace invite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept workspace invite',
      error: error.message
    });
  }
};

// Reject workspace invite
export const rejectWorkspaceInvite = async (req, res) => {
  try {
    const { workspaceId, inviteId } = req.params;
    const userId = req.user._id;

    // Find the invite (using your model structure)
    const invite = await WorkspaceInvite.findOne({
      _id: inviteId,
      workspaceId: workspaceId,
      user: userId,
      expiresAt: { $gt: new Date() }
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found or has expired'
      });
    }

    // Delete the invite after rejection
    await WorkspaceInvite.findByIdAndDelete(inviteId);

    res.status(200).json({
      success: true,
      message: 'Workspace invite rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting workspace invite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject workspace invite',
      error: error.message
    });
  }
};

// Get workspace invites (for workspace owners/admins)
export const getWorkspaceInvites = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    // Check if workspace exists and user has permission
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is owner or admin
    const userMember = workspace.members.find(member => 
      member.user.toString() === userId.toString()
    );
    
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view invites'
      });
    }

    // Get all invites for this workspace (using your model structure)
    const invites = await WorkspaceInvite.find({ 
      workspaceId: workspaceId,
      expiresAt: { $gt: new Date() } // Only get non-expired invites
    })
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        invites
      }
    });
  } catch (error) {
    console.error('Error fetching workspace invites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workspace invites',
      error: error.message
    });
  }
};

// Cancel workspace invite (for workspace owners/admins)
export const cancelWorkspaceInvite = async (req, res) => {
  try {
    const { workspaceId, inviteId } = req.params;
    const userId = req.user._id;

    // Check if workspace exists and user has permission
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is owner or admin
    const userMember = workspace.members.find(member => 
      member.user.toString() === userId.toString()
    );
    
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel invites'
      });
    }

    // Find and delete the invite (using your model structure)
    const invite = await WorkspaceInvite.findOneAndDelete({
      _id: inviteId,
      workspaceId: workspaceId,
      expiresAt: { $gt: new Date() }
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found or already expired'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workspace invite cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling workspace invite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel workspace invite',
      error: error.message
    });
  }
};