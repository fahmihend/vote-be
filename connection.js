//database connection
const mongoose = require("mongoose");
require("dotenv").config();

const databaseConnection = async () => {
  try {
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
    });
    console.log("Database Connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = databaseConnection;
