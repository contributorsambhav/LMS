import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Institute } from "../models/Institute";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: "SuperAdmin" | "InstituteAdmin" | "Faculty" | "Student";
    instituteId: string | null;
  };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication failed: No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || "super_fallback_jwt_secret_lumenlms";
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    const user = await User.findById(decoded.id || decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Authentication failed: User not found." });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as any,
      instituteId: user.instituteId ? user.instituteId.toString() : null
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed: Invalid or expired token." });
  }
};

export const checkRole = (allowedRoles: ("SuperAdmin" | "InstituteAdmin" | "Faculty" | "Student")[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied: User not authenticated." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied: Required role not found. Allowed roles: ${allowedRoles.join(", ")}` 
      });
    }

    next();
  };
};

export const checkApproved = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Access denied: User not authenticated." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Access denied: User not found." });
    }

    if (user.status === "Suspended") {
      return res.status(403).json({ message: "Access denied: Your account is suspended." });
    }

    if (user.role === "SuperAdmin") {
      return next();
    }

    if (user.status === "Pending") {
      if (user.role === "InstituteAdmin") {
        return res.status(403).json({ message: "Access denied: Your Institute Admin account is pending approval by the Super Admin." });
      }
      // Note: Students and Faculty are ALLOWED to access their endpoints while pending
      // so they can access their dashboard, manage profiles, and enroll in global courses.
    }

    if (user.role === "InstituteAdmin") {
      if (!user.instituteId) {
        return res.status(403).json({ message: "Access denied: No linked Institute found." });
      }
      const institute = await Institute.findById(user.instituteId);
      if (!institute || institute.status !== "Active") {
        return res.status(403).json({ message: "Access denied: Your Institute is pending approval or suspended." });
      }
    }

    next();
  } catch (error) {
    console.error("checkApproved middleware error:", error);
    return res.status(500).json({ message: "Internal server error during authorization checks." });
  }
};
