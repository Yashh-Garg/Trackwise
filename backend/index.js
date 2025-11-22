import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";

import routes from "./routes/index.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));

// db connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB Connected successfully."))
  .catch((err) => console.log("Failed to connect to DB:", err));

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to WebPM API",
  });
});

app.use('/uploads/avatars', express.static(path.join(process.cwd(), 'uploads/avatars')));
// http:localhost:5000/api-v1/
app.use("/api-v1", routes);

// error middleware
app.use((err, req, res, next) => {
  console.error("=== Error Middleware ===");
  console.error("Error status:", err.status, err.statusCode);
  console.error("Error message:", err.message);
  console.error("Error name:", err.name);
  
  // Handle validation errors from zod-express-middleware
  // zod-express-middleware typically adds errors to req.zodError
  if (err.status === 400 || err.statusCode === 400 || err.name === 'ValidationError' || err.zodError) {
    const zodError = err.zodError || err.errors;
    return res.status(400).json({
      message: err.message || "Validation error",
      errors: zodError?.issues || zodError || err.errors,
    });
  }
  
  if (err.stack) {
    console.error("Stack:", err.stack);
  }
  
  res.status(err.status || err.statusCode || 500).json({ 
    message: err.message || "Internal server error" 
  });
});

// not found middleware
app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});