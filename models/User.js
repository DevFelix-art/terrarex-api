import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  apisUsed: { type: Number, default: 0 }
});

export default mongoose.model("User", userSchema);
