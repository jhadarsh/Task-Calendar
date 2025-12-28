// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // adjust path if needed

exports.isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔑 FETCH FULL USER
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // ✅ FULL USER OBJECT
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
