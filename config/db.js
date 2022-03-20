const mongoose = require("mongoose");

// Connect to MongoDB
const connectDB = async (db) => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("MongoDB is Connected");
  } catch (error) {
    console.error(error.message);

    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB; // Export and return a function