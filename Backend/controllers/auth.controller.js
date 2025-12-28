const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
/* ---------- SIGNUP ---------- */
const signup = async (req, res, next) => {
  try {
    const { name, email, password, goals } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      goals: goals || [],
      verified: false, // 🔴 IMPORTANT
    });

    res.status(201).json({
      success: true,
      message: "Signup successful. Await verification.",
    });
  } catch (err) {
    next(err);
  }
};


// const getMe = async (req, res, next) => {
//   try {
//     res.json({
//       success: true,
//       user: req.user
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};



/* ---------- LOGIN ---------- */
/* ---------- LOGIN ---------- */
const login = async (req, res) => {
  const user = req.user;

  // 🔒 Verification check
  if (!user.verified) {
    return res.status(403).json({
      success: false,
      message:
        "Your account is not verified yet. Please contact the administrator for activation.",
    });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};


module.exports = {
  signup,
  login,
  getMe
};
