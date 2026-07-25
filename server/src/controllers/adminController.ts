import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Course } from "../models/Course";
import { Subject } from "../models/Subject";
import { User } from "../models/User";
import { Enrollment } from "../models/Enrollment";
import { Institute } from "../models/Institute";
import { Transaction } from "../models/Transaction";
import crypto from "crypto";

// Helper to generate unique 6-character alphanumeric codes
const generateUniqueCode = async (): Promise<string> => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let isUnique = false;
  let code = "";

  while (!isUnique) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await Course.findOne({ 
      $or: [{ facultyCode: code }, { studentCode: code }] 
    });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

// Course Management
export const createCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    if (!name || !description) {
      return res.status(400).json({ message: "Course name and description are required." });
    }

    const facultyCode = await generateUniqueCode();
    const studentCode = await generateUniqueCode();

    const course = new Course({
      name,
      description,
      instituteId,
      facultyCode,
      studentCode
    });

    await course.save();

    return res.status(201).json({
      message: "Course created successfully!",
      course
    });
  } catch (error: any) {
    console.error("Create course error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    const courses = await Course.find({ instituteId });
    return res.status(200).json(courses);
  } catch (error: any) {
    console.error("Get courses error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Subject Management
export const createSubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, courseId } = req.body;
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    if (!name || !courseId) {
      return res.status(400).json({ message: "Subject name and courseId are required." });
    }

    // Verify course belongs to this institute
    const course = await Course.findOne({ _id: courseId, instituteId });
    if (!course) {
      return res.status(404).json({ message: "Course not found in this institute." });
    }

    const subject = new Subject({
      name,
      courseId,
      instituteId,
      assignedFacultyId: null
    });

    await subject.save();

    return res.status(201).json({
      message: "Subject created successfully!",
      subject
    });
  } catch (error: any) {
    console.error("Create subject error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const deleteSubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    const subject = await Subject.findOneAndDelete({ _id: id, instituteId });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found in this institute." });
    }

    return res.status(200).json({ message: "Subject deleted successfully." });
  } catch (error: any) {
    console.error("Delete subject error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const assignSubjectFaculty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // Subject ID
    const { assignedFacultyId } = req.body;
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    // Verify subject belongs to this institute
    const subject = await Subject.findOne({ _id: id, instituteId });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found in this institute." });
    }

    if (assignedFacultyId) {
      // Verify faculty user exists and has Faculty role
      const faculty = await User.findOne({ _id: assignedFacultyId, role: "Faculty" });
      if (!faculty) {
        return res.status(400).json({ message: "Invalid faculty assignment: User not found or role is not Faculty." });
      }
    }

    subject.assignedFacultyId = assignedFacultyId || null;
    await subject.save();

    return res.status(200).json({
      message: "Subject faculty assignment updated successfully.",
      subject
    });
  } catch (error: any) {
    console.error("Assign faculty error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// User Management (Removal from Institute & courses)
export const removeFaculty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // Faculty User ID
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    // Verify user exists and is a Faculty
    const faculty = await User.findOne({ _id: id, role: "Faculty" });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty member not found." });
    }

    // Fetch all courses in this institute
    const courses = await Course.find({ instituteId });
    const courseIds = courses.map((c) => c._id);

    // Remove enrollment from all courses belonging to this institute
    await Enrollment.deleteMany({ userId: id, courseId: { $in: courseIds } });

    // Reset assignedFacultyId to null for all subjects in this institute's courses
    await Subject.updateMany(
      { courseId: { $in: courseIds }, assignedFacultyId: id },
      { $set: { assignedFacultyId: null } }
    );

    // Check if they are still enrolled in courses elsewhere. If not, set instituteId to null.
    const remainingEnrollments = await Enrollment.countDocuments({ userId: id });
    if (remainingEnrollments === 0 && faculty.instituteId?.toString() === instituteId.toString()) {
      faculty.instituteId = null;
      await faculty.save();
    }

    return res.status(200).json({ 
      message: "Faculty member has been successfully removed from this institute's courses and subjects." 
    });
  } catch (error: any) {
    console.error("Remove faculty error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const removeStudent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // Student User ID
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    // Verify user exists and is a Student
    const student = await User.findOne({ _id: id, role: "Student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Fetch all courses in this institute
    const courses = await Course.find({ instituteId });
    const courseIds = courses.map((c) => c._id);

    // Remove enrollment from all courses belonging to this institute
    await Enrollment.deleteMany({ userId: id, courseId: { $in: courseIds } });

    // Check if they are still enrolled in courses elsewhere. If not, set instituteId to null.
    const remainingEnrollments = await Enrollment.countDocuments({ userId: id });
    if (remainingEnrollments === 0 && student.instituteId?.toString() === instituteId.toString()) {
      student.instituteId = null;
      await student.save();
    }

    return res.status(200).json({ 
      message: "Student has been successfully removed from this institute's courses." 
    });
  } catch (error: any) {
    console.error("Remove student error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Approval Management for Institute Admins
export const getPendingUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    // Faculty: pending = affiliationStatus is "Pending" (their account status is always Approved)
    // Student: pending = status is "Pending"
    const pendingUsers = await User.find({
      instituteId,
      role: { $in: ["Faculty", "Student"] },
      $or: [
        { role: "Faculty", affiliationStatus: "Pending" },
        { role: "Student", status: "Pending" }
      ]
    }, "name email role status affiliationStatus createdAt");

    return res.status(200).json(pendingUsers);
  } catch (error: any) {
    console.error("Get pending users error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Approved" | "Suspended" | "Pending"
    const instituteId = req.user?.instituteId;

    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    if (!status || !["Approved", "Suspended", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value specified." });
    }

    const user = await User.findOne({ _id: id, instituteId, role: { $in: ["Faculty", "Student"] } });
    if (!user) {
      return res.status(404).json({ message: "User not found within this institute." });
    }

    user.status = status;

    // For Faculty: approving means setting affiliationStatus = Approved.
    // Rejecting/Pending means reverting affiliation.
    if (user.role === "Faculty") {
      if (status === "Approved") {
        user.affiliationStatus = "Approved";
      } else if (status === "Pending") {
        user.affiliationStatus = "Pending";
      } else if (status === "Suspended") {
        // Suspended faculty: keep affiliationStatus as-is but could be set to Unaffiliated
        user.affiliationStatus = "Unaffiliated";
        user.instituteId = null;
      }
    }

    await user.save();

    return res.status(200).json({
      message: `User status successfully updated to ${status}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        affiliationStatus: user.affiliationStatus
      }
    });
  } catch (error: any) {
    console.error("Update user status error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getInstituteProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }

    res.status(200).json(institute);
  } catch (error) {
    console.error("Error fetching institute profile:", error);
    res.status(500).json({ message: "Failed to fetch institute profile", error });
  }
};

export const getRoster = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    // Faculty: affiliated = affiliationStatus "Approved" (their user status is always "Approved")
    // Student: enrolled = status "Approved"
    const allUsers = await User.find({
      instituteId,
      role: { $in: ["Faculty", "Student"] }
    }, "name email role createdAt status affiliationStatus");

    const faculties = allUsers.filter(u => u.role === "Faculty" && u.affiliationStatus === "Approved");
    const students = allUsers.filter(u => u.role === "Student" && u.status === "Approved");

    return res.status(200).json({ faculties, students });
  } catch (error: any) {
    console.error("Get roster error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const updateInstituteProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    const { legalName, brandName, phoneNumber, address, email, billingPlan, zoomAccountId, zoomClientId, zoomClientSecret } = req.body;

    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }

    // Update only allowed fields
    if (legalName) institute.legalName = legalName;
    if (brandName) {
      institute.brandName = brandName;
      institute.name = brandName; // keep name in sync with brandName
    }
    if (phoneNumber) institute.phoneNumber = phoneNumber;
    if (address) institute.address = address;
    if (email) institute.email = email;
    if (billingPlan) institute.billingPlan = billingPlan;

    // Zoom Server-to-Server OAuth credentials
    if (zoomAccountId !== undefined) institute.zoomAccountId = zoomAccountId;
    if (zoomClientId !== undefined) institute.zoomClientId = zoomClientId;
    if (zoomClientSecret !== undefined) institute.zoomClientSecret = zoomClientSecret;

    await institute.save();

    res.status(200).json({ message: "Institute profile updated successfully", institute });
  } catch (error) {
    console.error("Error updating institute profile:", error);
    res.status(500).json({ message: "Failed to update institute profile", error });
  }
};

export const verifyRecharge = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body;
    
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !amount) {
       return res.status(400).json({ message: 'Payment details or amount missing.' });
    }
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(body.toString())
        .digest("hex");
        
    if (expectedSignature !== razorpay_signature) {
       return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }

    institute.walletBalance += Number(amount);
    await institute.save();
    
    await Transaction.create({
      instituteId: institute._id,
      amount: Number(amount),
      type: "Recharge",
      description: `Wallet recharge via Razorpay (Order: ${razorpay_order_id})`
    });

    res.status(200).json({ message: "Wallet recharged successfully", institute });
  } catch (error) {
    console.error("Error verifying recharge:", error);
    res.status(500).json({ message: "Failed to verify recharge", error });
  }
};

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    if (!instituteId) {
      return res.status(403).json({ message: "Access denied: Institute Admin is not linked to an Institute." });
    }

    const transactions = await Transaction.find({ instituteId }).sort({ createdAt: -1 }).limit(100);
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions", error });
  }
};
