import mongoose from "mongoose";

const resetKeySchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  expiresAt: {
    type: Date,
    expires: 3600, // The TTL index will handle document expiration
    default: Date.now, // Set the default expiration date
  },
});

export { resetKeySchema };
