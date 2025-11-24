# Trackwise 📊

A modern, full-stack project management application inspired by Jira, built with React Router v7, Node.js, Express, and MongoDB. Trackwise helps teams collaborate, manage projects, and track tasks efficiently.

![Trackwise](https://img.shields.io/badge/Trackwise-Project%20Management-blue)
![React Router](https://img.shields.io/badge/React%20Router-v7-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)

## ✨ Features

### 🏢 Workspace Management
- Create and manage multiple workspaces
- Invite team members via email
- Role-based access control (Owner, Member)
- Workspace settings and customization
- Color-coded workspaces for easy identification

### 📁 Project Management
- Create projects within workspaces
- Track project progress automatically
- Project status tracking (Planning, In Progress, On Hold, Completed, Cancelled)
- Project members with roles (Manager, Contributor, Viewer)
- Project tags and descriptions
- Start and due date tracking

### ✅ Task Management
- Create, update, and delete tasks
- Task status workflow (To Do → In Progress → Done)
- Priority levels (Low, Medium, High)
- Assign tasks to multiple team members
- Task watchers for notifications
- Subtasks with completion tracking
- Task comments and discussions
- File attachments
- Due date tracking with overdue indicators
- Task archiving and restoration

### 📊 Dashboard & Analytics
- Real-time statistics and metrics
- Interactive charts and visualizations
  - Task trends over time
  - Project status breakdown
  - Task priority distribution
  - Workspace productivity metrics
- Recent projects overview
- Upcoming tasks with due dates
- Progress tracking

### 👥 Collaboration
- Real-time notifications via Socket.IO
- Activity logs for all actions
- Comment threads on tasks
- @mentions support (coming soon)
- File sharing and attachments
- Team member management

### 🎨 User Experience
- Modern, minimalist UI design
- Dark/Light theme toggle
- Responsive design (mobile, tablet, desktop)
- Keyboard shortcuts
- Quick task status updates
- Advanced search and filtering
- Board view and list view for tasks
- Drag and drop (coming soon)

### 🔐 Authentication & Security
- Email/password authentication
- Google OAuth integration
- Email verification
- Password reset functionality
- JWT-based authentication
- Secure file uploads
- Role-based permissions

### 📱 Additional Features
- User profiles with avatar upload
- My Tasks view (personal task management)
- Achieved tasks archive
- Notification center
- Workspace invitations
- Activity timeline

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Router v7
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Real-time**: Socket.IO Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **File Upload**: Multer
- **Email**: SendGrid / Nodemailer
- **Real-time**: Socket.IO
- **Security**: Arcjet (rate limiting, bot protection)

### DevOps
- **Containerization**: Docker & Docker Compose
- **Development**: Nodemon (hot reload)
- **Build**: Vite

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) or MongoDB Atlas account
- **npm** or **yarn** or **pnpm**
- **Git**

Optional:
- **Docker** and **Docker Compose** (for containerized deployment)

## 🚀 Quick Start

### Option 1: Local Development (Recommended for Development)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Trackwise
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Create `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/trackwise
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   FRONTEND_URL=http://localhost:5173
   ARCJET_KEY=your-arcjet-key
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_FROM=noreply@trackwise.com
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api-v1
   VITE_FILES_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

6. **Start the development servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api-v1

### Option 2: Docker (Recommended for Production)

See [README.Docker.md](./README.Docker.md) for detailed Docker setup instructions.

**Quick Docker start:**
```bash
docker-compose up --build
```

## 📁 Project Structure

```
Trackwise/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── auth-controller.js
│   │   ├── project.js
│   │   ├── task.js
│   │   ├── user.js
│   │   ├── workspace.js
│   │   └── notification.js
│   ├── models/              # Mongoose schemas
│   │   ├── user.js
│   │   ├── workspace.js
│   │   ├── project.js
│   │   ├── task.js
│   │   ├── comment.js
│   │   ├── notification.js
│   │   └── activity.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── workspace.js
│   │   ├── project.js
│   │   ├── task.js
│   │   ├── user.js
│   │   └── notification.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth-middleware.js
│   │   └── upload-middleware.js
│   ├── libs/               # Utility functions
│   │   ├── send-email.js
│   │   ├── validate-schema.js
│   │   └── notification-service.js
│   ├── socket/             # Socket.IO server
│   │   └── socket-server.js
│   ├── uploads/            # File uploads directory
│   ├── index.js            # Entry point
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── components/     # React components
│   │   │   ├── dashboard/
│   │   │   ├── layout/
│   │   │   ├── project/
│   │   │   ├── task/
│   │   │   ├── workspace/
│   │   │   └── ui/         # Reusable UI components
│   │   ├── routes/         # Page components
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── user/
│   │   │   └── root/
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── provider/       # Context providers
│   │   ├── types/          # TypeScript types
│   │   ├── app.css         # Global styles
│   │   ├── root.tsx        # Root component
│   │   └── routes.ts       # Route configuration
│   ├── public/            # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
└── README.md              # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api-v1/auth/register` - Register new user
- `POST /api-v1/auth/login` - User login
- `POST /api-v1/auth/google` - Google OAuth
- `POST /api-v1/auth/verify-email` - Verify email
- `POST /api-v1/auth/forgot-password` - Request password reset
- `POST /api-v1/auth/reset-password` - Reset password

### Workspaces
- `GET /api-v1/workspaces` - Get user's workspaces
- `POST /api-v1/workspaces` - Create workspace
- `GET /api-v1/workspaces/:workspaceId` - Get workspace details
- `PUT /api-v1/workspaces/:workspaceId` - Update workspace
- `DELETE /api-v1/workspaces/:workspaceId` - Delete workspace
- `GET /api-v1/workspaces/:workspaceId/projects` - Get workspace projects
- `GET /api-v1/workspaces/:workspaceId/stats` - Get workspace statistics
- `POST /api-v1/workspaces/:workspaceId/invite-member` - Invite member
- `POST /api-v1/workspaces/accept-invite-token` - Accept invitation

### Projects
- `POST /api-v1/projects/:workspaceId/create-project` - Create project
- `GET /api-v1/projects/:projectId` - Get project details
- `PUT /api-v1/projects/:projectId` - Update project
- `DELETE /api-v1/projects/:projectId` - Delete project

### Tasks
- `POST /api-v1/tasks/:projectId/create-task` - Create task
- `GET /api-v1/tasks/:taskId` - Get task details
- `GET /api-v1/tasks/my-tasks` - Get user's assigned tasks
- `PUT /api-v1/tasks/:taskId/title` - Update task title
- `PUT /api-v1/tasks/:taskId/status` - Update task status
- `PUT /api-v1/tasks/:taskId/priority` - Update task priority
- `PUT /api-v1/tasks/:taskId/assignees` - Update assignees
- `POST /api-v1/tasks/:taskId/add-subtask` - Add subtask
- `PUT /api-v1/tasks/:taskId/update-subtask/:subTaskId` - Update subtask
- `POST /api-v1/tasks/:taskId/add-comment` - Add comment
- `GET /api-v1/tasks/:taskId/comments` - Get task comments
- `POST /api-v1/tasks/:taskId/watch` - Watch task
- `POST /api-v1/tasks/:taskId/achieved` - Archive task
- `GET /api-v1/tasks/achieved` - Get archived tasks
- `PUT /api-v1/tasks/:taskId/restore` - Restore archived task
- `DELETE /api-v1/tasks/:taskId` - Delete task

### Users
- `GET /api-v1/users/profile` - Get user profile
- `PUT /api-v1/users/profile` - Update user profile
- `POST /api-v1/users/upload-avatar` - Upload avatar
- `PUT /api-v1/users/change-password` - Change password

### Notifications
- `GET /api-v1/notifications` - Get user notifications
- `PUT /api-v1/notifications/:notificationId/read` - Mark as read
- `PUT /api-v1/notifications/read-all` - Mark all as read

## 🔐 Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/trackwise

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Security (Arcjet)
ARCJET_KEY=your-arcjet-key

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@trackwise.com

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api-v1
VITE_FILES_URL=http://localhost:5000

# OAuth
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

## 🧪 Development

### Running Tests
```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

### Code Formatting
```bash
# Format backend code
cd backend
npm run format

# Format frontend code
cd frontend
npm run format
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Start production server
npm start
```

## 🐳 Docker Commands

See [README.Docker.md](./README.Docker.md) for complete Docker documentation.

**Quick reference:**
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build
```

## 🎨 UI/UX Features

- **Modern Design**: Clean, minimalist interface
- **Dark Mode**: Full dark/light theme support
- **Responsive**: Works on all devices
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized with React Query caching
- **Real-time Updates**: Socket.IO for live notifications

## 📈 Roadmap

### Planned Features
- [ ] Task dependencies
- [ ] Time tracking
- [ ] Calendar view
- [ ] Gantt chart
- [ ] Advanced search
- [ ] Task templates
- [ ] Bulk operations
- [ ] Export functionality (CSV, PDF)
- [ ] Email notifications
- [ ] Task mentions (@username)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Inspired by Jira and other project management tools
- Built with amazing open-source libraries
- UI components from Radix UI
- Icons from Lucide React


**Made with ❤️ for better project management**

