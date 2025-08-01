import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    profilePicture: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    is2FAEnabled: { type: Boolean, default: false },
    twoFAOtp: { type: String, select: false },
    twoFAOtpExpires: { type: Date, select: false },
  },
  {
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  // Make password optional for Google users
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    }
  }
},
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

export default User;