const mongoose = require("mongoose")

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected Successfully.");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connect;

