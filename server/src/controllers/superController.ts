import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { Institute } from "../models/Institute";
import { User } from "../models/User";
import { Verification } from "../models/Verification";
import { Plan } from "../models/Plan";
import { Transaction } from "../models/Transaction";
import { PromoCode } from "../models/PromoCode";
import { Session } from "../models/Session";
import { Material } from "../models/Material";
import { Quiz } from "../models/Quiz";
import { QuizAttempt } from "../models/QuizAttempt";
import { Assignment } from "../models/Assignment";
import { Submission } from "../models/Submission";
import { DoubtThread } from "../models/DoubtThread";
import { Message } from "../models/Message";
import { Progress } from "../models/Progress";
import { Lesson } from "../models/Lesson";
import mongoose from "mongoose";

export const getInstitutes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const institutes = await Institute.find().populate("adminId", "name email role status");

    const enrichedInstitutes = await Promise.all(
      institutes.map(async (inst) => {
        const courses = await Course.find({ instituteId: inst._id }, "_id");
        const courseIds = courses.map(c => c._id);

        const courseCount = courseIds.length;
        const facultyCount = await User.countDocuments({
          instituteId: inst._id,
          role: "Faculty"
        });
        const studentCount = await User.countDocuments({
          instituteId: inst._id,
          role: "Student"
        });

        return {
          id: inst._id,
          name: inst.name,
          address: inst.address,
          status: inst.status || "Pending",
          billingPlan: inst.billingPlan || "Basic",
          walletBalance: inst.walletBalance,
          negativeDaysCount: inst.negativeDaysCount,
          createdAt: inst.createdAt,
          admin: inst.adminId,
          usage: {
            courses: courseCount,
            faculty: facultyCount,
            students: studentCount
          }
        };
      })
    );

    return res.status(200).json(enrichedInstitutes);
  } catch (error: any) {
    console.error("Super Admin getInstitutes error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const updateInstituteStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Active", "Suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status state specified." });
    }

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }

    institute.status = status;
    await institute.save();

    const userStatus = status === "Active" ? "Approved" : "Suspended";
    const adminUser = await User.findById(institute.adminId);
    if (adminUser) {
      adminUser.status = userStatus;
      await adminUser.save();
    }

    return res.status(200).json({
      message: `Institute successfully marked as ${status}.`,
      institute
    });
  } catch (error: any) {
    console.error("Super Admin updateInstituteStatus error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const updateInstituteBilling = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { billingPlan } = req.body;

    const allowedPlans = ["Basic", "Premium", "Enterprise", "Custom"];
    if (!billingPlan || !allowedPlans.includes(billingPlan)) {
      return res.status(400).json({ message: "Invalid billing plan specified." });
    }

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }

    institute.billingPlan = billingPlan as any;
    await institute.save();

    return res.status(200).json({
      message: `Institute billing plan updated to ${billingPlan}.`,
      institute
    });
  } catch (error: any) {
    console.error("Super Admin updateInstituteBilling error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const getVerificationRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = await Verification.find({ status: "Pending" })
      .populate("instituteId", "name address status")
      .populate("adminId", "name email role status");

    return res.status(200).json(requests);
  } catch (error: any) {
    console.error("Super Admin getVerificationRequests error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const approveVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({ message: "Verification request not found." });
    }
    if (verification.status !== "Pending") {
      return res.status(400).json({ message: "Verification request already processed." });
    }

    const institute = await Institute.findById(verification.instituteId as any);
    const adminUser = await User.findById(verification.adminId as any);
    if (!institute || !adminUser) {
      return res.status(404).json({ message: "Associated institute or admin user not found." });
    }

    institute.status = "Active";
    await institute.save();

    adminUser.status = "Approved";
    await adminUser.save();

    verification.status = "Approved";
    verification.approvedBy = req.user?.id ? (new mongoose.Types.ObjectId(req.user.id) as any) : null;
    verification.approvedAt = new Date();
    await verification.save();

    return res.status(200).json({ message: "Verification approved and institute activated.", verification });
  } catch (error: any) {
    console.error("Super Admin approveVerification error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const rejectVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({ message: "Verification request not found." });
    }
    if (verification.status !== "Pending") {
      return res.status(400).json({ message: "Verification request already processed." });
    }

    const institute = await Institute.findById(verification.instituteId as any);
    const adminUser = await User.findById(verification.adminId as any);
    if (!institute || !adminUser) {
      return res.status(404).json({ message: "Associated institute or admin user not found." });
    }

    institute.status = "Suspended";
    await institute.save();

    adminUser.status = "Suspended";
    await adminUser.save();

    verification.status = "Rejected";
    verification.approvedBy = req.user?.id ? (new mongoose.Types.ObjectId(req.user.id) as any) : null;
    verification.approvedAt = new Date();
    await verification.save();

    return res.status(200).json({ message: "Verification rejected and institute suspended.", verification });
  } catch (error: any) {
    console.error("Super Admin rejectVerification error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const deleteInstitute = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }

    // 1. Fetch all associated courses
    const courses = await Course.find({ instituteId: id });
    const courseIds = courses.map(c => c._id);

    // 2. Trigger R2 Asset Deletion for each course via stream-service
    const streamServiceUrl = process.env.STREAM_SERVICE_URL || "http://localhost:4000";
    for (const courseId of courseIds) {
      try {
        await fetch(`${streamServiceUrl}/api/upload/course/${id}/${courseId}`, {
          method: "DELETE"
        });
        console.log(`Successfully triggered R2 cleanup for course ${courseId}`);
      } catch (err) {
        console.error(`Failed to clean up course assets from R2 for ${courseId}:`, err);
      }
    }

    // 3. Delete everything associated with courses
    if (courseIds.length > 0) {
      await Course.deleteMany({ instituteId: id });
      await Session.deleteMany({ courseId: { $in: courseIds } });
      await Material.deleteMany({ courseId: { $in: courseIds } });
      await Lesson.deleteMany({ courseId: { $in: courseIds } });
      await Quiz.deleteMany({ courseId: { $in: courseIds } });
      await QuizAttempt.deleteMany({ courseId: { $in: courseIds } });
      await Assignment.deleteMany({ courseId: { $in: courseIds } });
      await Submission.deleteMany({ courseId: { $in: courseIds } });
      await DoubtThread.deleteMany({ courseId: { $in: courseIds } });
      await Message.deleteMany({ courseId: { $in: courseIds } });
      await Progress.deleteMany({ courseId: { $in: courseIds } });
      await Enrollment.deleteMany({ courseId: { $in: courseIds } });
    }

    // 4. Delete users and everything explicitly bound to those users
    const users = await User.find({ instituteId: id });
    const userIds = users.map(u => u._id);

    if (userIds.length > 0) {
      await Progress.deleteMany({ userId: { $in: userIds } });
      await Enrollment.deleteMany({ userId: { $in: userIds } });
      await DoubtThread.deleteMany({ authorId: { $in: userIds } });
      await Message.deleteMany({ senderId: { $in: userIds } });
      await QuizAttempt.deleteMany({ studentId: { $in: userIds } });
      await Submission.deleteMany({ studentId: { $in: userIds } });
      await User.deleteMany({ instituteId: id });
    }

    // 5. Delete tenant specific root records
    await Verification.deleteMany({ instituteId: id });
    await Transaction.deleteMany({ instituteId: id });
    await Institute.findByIdAndDelete(id);

    return res.status(200).json({ message: "Tenant, all associated courses, users, and R2 storage assets have been permanently wiped." });
  } catch (error) {
    console.error("Error deleting institute:", error);
    return res.status(500).json({ message: "Failed to wipe tenant and its data." });
  }
};

export const getPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = await Plan.find().sort({ createdAt: 1 });
    return res.status(200).json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return res.status(500).json({ message: "Failed to fetch pricing plans." });
  }
};

export const updatePlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { price, apiLimit, details, maxStorageGB, maxStudents, name } = req.body;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    if (price !== undefined) plan.price = price;
    if (name !== undefined) plan.name = name;
    if (apiLimit !== undefined) plan.apiLimit = apiLimit;
    if (details !== undefined) plan.details = details;
    if (maxStorageGB !== undefined) plan.maxStorageGB = maxStorageGB;
    if (maxStudents !== undefined) plan.maxStudents = maxStudents;

    await plan.save();

    return res.status(200).json({ message: "Plan parameters updated successfully.", plan });
  } catch (error) {
    console.error("Error updating plan:", error);
    return res.status(500).json({ message: "Failed to update pricing plan." });
  }
};

export const getStudents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const students = await User.find({ role: "Student" }).populate("instituteId", "name brandName legalName status");
    return res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ message: "Failed to fetch students." });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.role === "SuperAdmin") {
      return res.status(403).json({ message: "Cannot delete a Super Admin." });
    }

    if (user.role === "InstituteAdmin") {
      return res.status(403).json({ message: "To delete an Institute Admin, you must delete their Institute Tenant instead." });
    }

    await Enrollment.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "User completely removed from system." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Failed to delete user." });
  }
};

export const getStudentDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id).populate("instituteId", "name brandName");
    
    if (!student || student.role !== "Student") {
      return res.status(404).json({ message: "Student not found." });
    }

    const enrollments = await Enrollment.find({ userId: id }).populate({
      path: "courseId",
      populate: {
        path: "instituteId",
        select: "name brandName legalName email phoneNumber"
      }
    });

    return res.status(200).json({
      student,
      enrollments: enrollments.map((e: any) => ({
        id: e._id,
        courseName: e.courseId?.name,
        courseCode: e.courseId?.studentCode || e.courseId?.courseCode,
        institute: e.courseId?.instituteId,
        enrolledAt: e.joinedAt
      }))
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    return res.status(500).json({ message: "Failed to fetch student details." });
  }
};

export const getGlobalTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transactions = await Transaction.find().populate("instituteId", "name brandName").sort({ createdAt: -1 }).limit(200);
    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching global transactions:", error);
    return res.status(500).json({ message: "Failed to fetch global transactions." });
  }
};

export const getPromoCodes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    return res.status(200).json(promos);
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return res.status(500).json({ message: "Failed to fetch promo codes." });
  }
};

export const createPromoCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, discountPercentage } = req.body;
    
    if (!code || discountPercentage === undefined) {
      return res.status(400).json({ message: "Code and discount percentage are required." });
    }
    
    const existing = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Promo code already exists." });
    }

    const promo = new PromoCode({
      code: code.toUpperCase(),
      discountPercentage: Number(discountPercentage)
    });
    
    await promo.save();
    return res.status(201).json({ message: "Promo code created successfully.", promo });
  } catch (error) {
    console.error("Error creating promo code:", error);
    return res.status(500).json({ message: "Failed to create promo code." });
  }
};

export const togglePromoCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const promo = await PromoCode.findById(id);
    
    if (!promo) {
      return res.status(404).json({ message: "Promo code not found." });
    }
    
    promo.isActive = !promo.isActive;
    await promo.save();
    
    return res.status(200).json({ message: `Promo code ${promo.isActive ? 'activated' : 'deactivated'}.`, promo });
  } catch (error) {
    console.error("Error toggling promo code:", error);
    return res.status(500).json({ message: "Failed to toggle promo code." });
  }
};

export const updateInstituteWallet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (amount === undefined || isNaN(Number(amount))) {
      return res.status(400).json({ message: "Invalid amount provided." });
    }

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }

    institute.walletBalance = (institute.walletBalance || 0) + Number(amount);
    
    // Reset negative days count if they are back in the green
    if (institute.walletBalance >= 0) {
      institute.negativeDaysCount = 0;
    }
    
    await institute.save();

    const transaction = new Transaction({
      instituteId: institute._id,
      amount: Math.abs(Number(amount)),
      type: Number(amount) >= 0 ? "Recharge" : "Manual Adjustment",
      description: `Super Admin Manual Adjustment: ${reason || (Number(amount) >= 0 ? "Added funds" : "Deducted funds")}`
    });
    await transaction.save();

    return res.status(200).json({ message: `Wallet successfully adjusted by ${amount > 0 ? '+' : ''}${amount}.`, walletBalance: institute.walletBalance });
  } catch (error: any) {
    console.error("updateInstituteWallet error:", error);
    return res.status(500).json({ message: "Failed to adjust wallet.", error: error.message });
  }
};

export const createPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planCode, name, price, apiLimit, details, maxStorageGB, maxStudents } = req.body;
    
    if (!planCode || !name || !price) {
      return res.status(400).json({ message: "Plan code, name, and price are required." });
    }

    const existingPlan = await Plan.findOne({ planCode });
    if (existingPlan) {
      return res.status(400).json({ message: "Plan with this code already exists." });
    }

    const plan = new Plan({
      planCode,
      name,
      price,
      apiLimit: apiLimit || "Unlimited",
      details: details || "Custom plan",
      maxStorageGB: maxStorageGB || 0,
      maxStudents: maxStudents || 0
    });
    
    await plan.save();
    return res.status(201).json({ message: "Plan created successfully.", plan });
  } catch (error: any) {
    console.error("createPlan error:", error);
    return res.status(500).json({ message: "Failed to create plan.", error: error.message });
  }
};

export const deletePlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);
    if (!plan) return res.status(404).json({ message: "Plan not found." });
    
    await plan.deleteOne();
    return res.status(200).json({ message: "Plan deleted successfully." });
  } catch (error: any) {
    console.error("deletePlan error:", error);
    return res.status(500).json({ message: "Failed to delete plan.", error: error.message });
  }
};

export const getInstituteStorage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const institute = await Institute.findById(id, "storageUsage");
    if (!institute) return res.status(404).json({ message: "Institute not found." });
    
    return res.status(200).json({
      videoBytes: institute.storageUsage?.videoBytes || 0,
      documentBytes: institute.storageUsage?.documentBytes || 0
    });
  } catch (error) {
    console.error("Error fetching storage:", error);
    return res.status(500).json({ message: "Failed to fetch storage." });
  }
};
