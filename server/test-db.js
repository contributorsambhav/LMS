const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.useDb('LumenLMS');
  const institutes = await db.collection('institutes').find({}).toArray();
  institutes.forEach(i => console.log(i._id, i.name, i.legalName, i.storageUsage));
  process.exit(0);
}
test();
