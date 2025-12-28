const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const password = process.env.MONGO_PASSWORD;

    if (!password) {
      throw new Error("MongoDB password missing");
    }

    const uri = `mongodb+srv://studyPlannerUser:${password}@taskcalendar.jameob2.mongodb.net/studyPlanner?retryWrites=true&w=majority&appName=TaskCalendar`;

    await mongoose.connect(uri);

    console.log("MongoDB Atlas connected (Mongoose)");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
