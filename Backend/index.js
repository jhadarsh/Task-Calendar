require("dotenv").config();
const express = require("express");
const passport = require("passport");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios"); // ✅ FIX 1: Import axios

const { connectDB } = require("./Config/db");

// Initialize passport strategies
require("./Config/passport");

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const subjectRoutes = require("./routes/subject.routes");
const userRoutes = require("./routes/user.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- MIDDLEWARES --------------------

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());

// -------------------- ROUTES --------------------

// Root
app.get("/", (req, res) => {
  res.send("Task Calendar Backend API is running");
});

// ✅ Health route (must exist before cron starts)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Server is running",
  });
});

// APIs
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// -------------------- ERROR HANDLER --------------------
app.use(errorHandler);

// -------------------- CRON LOGIC --------------------

const pingServer = async () => {
  try {
    const baseUrl =
      process.env.RENDER_URL || `http://localhost:${PORT}`;

    const response = await axios.get(`${baseUrl}/health`);

    console.log(
      `✅ Keep-alive ping successful: ${response.status} @ ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error(
      "❌ Keep-alive ping failed:",
      error.response?.status || error.message
    );
  }
};

const startKeepAliveCron = () => {
  cron.schedule("*/14 * * * *", async () => {
    console.log("⏱ Running keep-alive cron job...");
    await pingServer();
  });

  console.log("🚀 Keep-alive cron job scheduled (every 14 minutes)");
};

// -------------------- SERVER START --------------------

const startApp = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);

      // ✅ FIX 2: Start cron ONLY after server is live
      startKeepAliveCron();
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startApp();
