const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const login = async (req, res) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password || !role) {
    return res.status(400).json({ message: "Identifier, password, and role are required" });
  }

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

  return res.json({
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      universityId: user.universityId,
      role: user.role,
    },
  });
};

const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All password fields are required" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New password and confirm password do not match" });
  }

  const user = await User.findById(req.user._id);
  const isCurrentCorrect = await user.matchPassword(currentPassword);

  if (!isCurrentCorrect) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  return res.json({ message: "Password changed successfully" });
};

module.exports = { login, getMe, changePassword };
