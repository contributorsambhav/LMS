import { AuthenticatedRequest } from "../middleware/auth";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { Institute } from "../models/Institute";
import { Response } from "express";
import { User } from "../models/User";
import { Verification } from "../models/Verification";
import { Plan } from "../models/Plan";

export const getInstitutes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const institutes = await Institute.find().populate("adminId", "name email role status");

    const enrichedInstitutes = await Promise.all(
      institutes.map(async (inst) => {
        // Find course IDs
        const courses = await Course.find({ instituteId: inst._id }, "_id");
        const courseIds = courses.map(c => c._id);

        // Count direct users under this institute if any, and enrollments
        const courseCount = courseIds.length;
        const facultyCount = await Enrollment.countDocuments({
          courseId: { $in: courseIds },
          role: "Faculty"
        });
        const studentCount = await Enrollment.countDocuments({
          courseId: { $in: courseIds },
          role: "Student"
        });

        return {
          id: inst._id,
          name: inst.name,
          address: inst.address,
          status: inst.status || "Pending",
          billingPlan: inst.billingPlan || "Basic",
          createdAt: inst.createdAt,
          admin: inst.adminId, // Will contain populated user details
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
    const { status } = req.body; // "Active" | "Suspended"

    if (!status || !["Active", "Suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status state specified." });
    }

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }

    // Update institute status
    institute.status = status;
    await institute.save();

    // Also update associated InstituteAdmin status
    // "Active" maps to user status "Approved", "Suspended" maps to user status "Suspended"
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
    const { billingPlan } = req.body; // "Basic" | "Premium" | "Enterprise" | "Custom"

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
    verification.approvedBy = req.user?.id ?? null;
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
    verification.approvedBy = req.user?.id ?? null;
    verification.approvedAt = new Date();
    await verification.save();

    return res.status(200).json({ message: "Verification rejected and institute suspended.", verification });
  } catch (error: any) {
    console.error("Super Admin rejectVerification error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const deleteInstitute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const institute = await Institute.findById(id);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found." });
    }

    // Delete associated users (except SuperAdmin, which isn't linked to an institute anyway)
    await User.deleteMany({ instituteId: id });
    
    // Delete associated verifications
    await Verification.deleteMany({ instituteId: id });

    // Finally delete the institute
    await Institute.findByIdAndDelete(id);

    res.status(200).json({ message: "Tenant and all associated users have been permanently deleted." });
  } catch (error) {
    console.error("Error deleting institute:", error);
    res.status(500).json({ message: "Failed to delete tenant." });
  }
};

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find().sort({ createdAt: 1 });
    res.status(200).json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ message: "Failed to fetch pricing plans." });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { price, apiLimit, details } = req.body;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    if (price) plan.price = price;
    if (apiLimit) plan.apiLimit = apiLimit;
    if (details) plan.details = details;

    await plan.save();

    res.status(200).json({ message: "Plan parameters updated successfully.", plan });
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ message: "Failed to update pricing plan." });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await User.find({ role: "Student" }).populate("instituteId", "name brandName legalName status");
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students." });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
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

    // Delete related enrollments if user is a student
    await Enrollment.deleteMany({ studentId: id });

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User completely removed from system." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user." });
  }
};

export const getStudentDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id).populate("instituteId", "name brandName");
    
    if (!student || student.role !== "Student") {
      return res.status(404).json({ message: "Student not found." });
    }

    const enrollments = await Enrollment.find({ studentId: id }).populate({
      path: "courseId",
      populate: {
        path: "instituteId",
        select: "name brandName legalName email phoneNumber"
      }
    });

    res.status(200).json({
      student,
      enrollments: enrollments.map((e: any) => ({
        id: e._id,
        courseName: e.courseId?.name,
        courseCode: e.courseId?.studentCode || e.courseId?.courseCode,
        institute: e.courseId?.instituteId,
        enrolledAt: e.enrolledAt
      }))
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ message: "Failed to fetch student details." });
  }
};
