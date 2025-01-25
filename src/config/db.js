// config/db.js
const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connecté.`.bgBlue.bold);
  } catch (error) {
    console.error(`❌ Erreur de connexion à MongoDB:`.bgYellow, error);
    process.exit(1);
  }
};

module.exports = connectDB;
