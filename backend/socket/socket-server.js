import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`);
    });

    // Handle joining workspace rooms
    socket.on('join_workspace', (workspaceId) => {
      socket.join(`workspace_${workspaceId}`);
      console.log(`User ${socket.user.name} joined workspace ${workspaceId}`);
    });

    // Handle leaving workspace rooms
    socket.on('leave_workspace', (workspaceId) => {
      socket.leave(`workspace_${workspaceId}`);
      console.log(`User ${socket.user.name} left workspace ${workspaceId}`);
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};