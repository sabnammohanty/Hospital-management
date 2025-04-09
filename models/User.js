const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["admin", "doctor", "patient"], required: true,default:"patient" },
});

module.exports = mongoose.model("User", userSchema);