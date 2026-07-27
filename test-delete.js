const mongoose = require('mongoose');
const { connectDB } = require('./server/dist/config/db');
require('dotenv').config({path: './server/.env'});

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected");
  const User = mongoose.model('User');
  try {
     const count = await User.countDocuments();
     console.log("Users:", count);
  } catch (e) {
     console.log(e.message);
  }
  process.exit(0);
})();
