import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = 'mongodb+srv://sam:Sambhav1204@atlascluster.ycaagz6.mongodb.net/LumenLMS?retryWrites=true&w=majority&appName=AtlasCluster';

async function testDelete() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  // Find an admin or faculty user
  const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { strict: false }));
  const admin = await User.findOne({ role: 'InstituteAdmin' });
  const faculty = await User.findOne({ role: 'Faculty' });
  
  const userToUse = faculty || admin;
  if (!userToUse) {
    console.log("No faculty or admin found.");
    process.exit(1);
  }

  console.log("Using user:", userToUse.email, userToUse.role);

  // Generate JWT token
  const token = jwt.sign(
    { id: userToUse._id, email: userToUse.email, role: userToUse.role },
    process.env.JWT_SECRET || 'super_fallback_jwt_secret_lumenlms',
    { expiresIn: '1d' }
  );

  // Find a course
  const Course = mongoose.model('Course', new mongoose.Schema({ title: String }, { strict: false }));
  const course = await Course.findOne();
  if (!course) {
    console.log("No course found.");
    process.exit(1);
  }

  // Create a dummy quiz
  const Quiz = mongoose.model('Quiz', new mongoose.Schema({ courseId: mongoose.Schema.Types.ObjectId, title: String, createdBy: mongoose.Schema.Types.ObjectId }, { strict: false }));
  const dummyQuiz = new Quiz({
    courseId: course._id,
    title: 'Dummy Test Quiz ' + Date.now(),
    createdBy: userToUse._id
  });
  await dummyQuiz.save();
  console.log("Created dummy quiz:", dummyQuiz._id);

  // Attempt to delete it via API
  console.log("Calling API to delete quiz...");
  const res = await fetch(`http://localhost:5000/api/quizzes/${dummyQuiz._id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const responseText = await res.text();
  console.log(`Response Status: ${res.status}`);
  console.log(`Response Body: ${responseText}`);

  process.exit(0);
}

testDelete().catch(console.error);
