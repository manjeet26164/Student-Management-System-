const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const login = async (req, res) => {
  const { identifier, password, role } = req.body;

  const query = identifier.includes("@")
    ? { email: identifier.toLowerCase() }
    : { universityId: identifier };

  const user = await User.findOne(query);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.role !== role) {
    return res.status(403).json({ message: "Role does not match this account" });
  }

  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id, user.role);

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("erp_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  return res.json({
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      universityId: user.universityId,
      role: user.role,
    },
  });
};

const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("erp_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
  });
  return res.json({ message: "Logged out" });
};

const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  const isCurrentCorrect = await user.matchPassword(currentPassword);

  if (!isCurrentCorrect) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  return res.json({ message: "Password changed successfully" });
};

module.exports = { login, getMe, changePassword, logout };
