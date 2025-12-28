require("dotenv").config();
const express = require("express");
const passport = require("passport");
const cors = require("cors");
const { connectDB } = require("./Config/db");

// Initialize passport strategies
require("./Config/passport");

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const subjectRoutes = require("./routes/subject.routes");
const errorHandler = require("./middlewares/error.middleware");
const userRoutes = require("./routes/user.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- MIDDLEWARES --------------------

// ✅ CORS (Frontend Access)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Passport init
app.use(passport.initialize());

// -------------------- ROUTES --------------------

// Health check
app.get("/", (req, res) => {
  res.send("Task Calendar Backend API is running");
});

// Auth routes
app.use("/api/auth", authRoutes);

app.use("/api/subjects", subjectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);


// -------------------- ERROR HANDLER --------------------
app.use(errorHandler);

// -------------------- SERVER START --------------------
const startApp = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startApp();
