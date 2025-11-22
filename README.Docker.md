# Docker Setup for Trackwise

This guide explains how to run Trackwise using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed

## Quick Start

### Production Mode

1. **Create a `.env` file in the root directory** (optional, for custom configuration):
```env
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://mongodb:27017/trackwise
ARCJET_KEY=your-arcjet-key
SENDGRID_API_KEY=your-sendgrid-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

2. **Build and start all services**:
```bash
docker-compose up --build
```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api-v1
   - MongoDB: localhost:27017

### Development Mode (with hot reload)

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## Useful Commands

### Build images
```bash
docker-compose build
```

### Start services
```bash
docker-compose up
```

### Start in background
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (clears database)
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f
```

### View logs for specific service
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild specific service
```bash
docker-compose build backend
docker-compose up -d backend
```

### Execute commands in container
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Services

- **mongodb**: MongoDB database (port 27017)
- **backend**: Node.js backend API (port 5000)
- **frontend**: React frontend application (port 5173)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Backend
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://mongodb:27017/trackwise
ARCJET_KEY=your-arcjet-key
SENDGRID_API_KEY=your-sendgrid-api-key

# Frontend
VITE_API_URL=http://localhost:5000/api-v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Troubleshooting

### Port already in use
If ports 5000, 5173, or 27017 are already in use, modify the port mappings in `docker-compose.yml`.

### Database connection issues
Ensure MongoDB container is running:
```bash
docker-compose ps
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### Clear everything and start fresh
```bash
docker-compose down -v
docker-compose up --build
```

