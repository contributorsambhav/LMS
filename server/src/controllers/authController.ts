import { Request, Response } from 'express';

import { Institute } from '../models/Institute';
import { User } from '../models/User';
import { Verification } from '../models/Verification';
import { Plan } from '../models/Plan';
import { PromoCode } from '../models/PromoCode';
import { Transaction } from '../models/Transaction';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, instituteName, instituteAddress } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required registration fields.' });
    }

    const allowedRoles = ['InstituteAdmin', 'Faculty', 'Student'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    if (role === 'InstituteAdmin') {
      if (!instituteName || !instituteAddress) {
        return res.status(400).json({
          message: 'Institute name and address are required for registering an Institute Admin.'
        });
      }

      // Create pending Institute Admin user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'InstituteAdmin',
        status: 'Pending',
        instituteId: null
      });
      await user.save();

      // Create the new Institute linked to this admin
      const institute = new Institute({
        name: instituteName,
        address: instituteAddress,
        adminId: user._id
      });
      await institute.save();

      // Update the user's instituteId
      user.instituteId = institute._id as any;
      await user.save();

      // Create a verification request for Super Admin approval
      const verification = new Verification({
        instituteId: institute._id,
        adminId: user._id,
        status: 'Pending'
      });
      await verification.save();

      return res.status(201).json({
        message: 'Institute Admin registered successfully! Account is pending approval by the Super Admin.'
      });
    }

    // For Faculty and Student, they start as Approved directly and join courses/institutes dynamically
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'Approved',
      instituteId: null
    });
    await user.save();

    return res.status(201).json({
      message: `${role} registered successfully! You can now log in.`
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check approval/suspension status
    if (user.status === 'Suspended') {
      return res.status(403).json({
        message: 'Your account has been suspended by the platform administrator.'
      });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'super_fallback_jwt_secret_lumenlms';
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        status: user.status
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        status: user.status
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};


export const oauthLogin = async (req: Request, res: Response) => {
  try {
    const { name, email, role, picture, registrationDetails, action } = req.body;

    if (!email || !name || !role) {
      return res.status(400).json({ message: 'Missing required registration/login parameters.' });
    }

    if (role === 'SuperAdmin') {
      return res.status(403).json({ message: 'Access denied: Super Admin must authenticate via Super Code.' });
    }

    const allowedRoles = ['InstituteAdmin', 'Faculty', 'Student'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (user.role === 'SuperAdmin') {
        return res.status(403).json({ message: 'Access denied: Super Admin must authenticate via Super Code.' });
      }

      if (user.role !== role) {
        return res.status(409).json({ message: `Role mismatch: This email is registered as a ${user.role}. You cannot login as a ${role}.` });
      }

      // Check status
      if (user.status === 'Suspended') {
        return res.status(403).json({
          message: 'Your account has been suspended by the platform administrator.'
        });
      }

      // Update name/picture if needed (optional)
      user.name = name;
      await user.save();
    } else {
      // User does not exist
      if (action === 'login') {
        return res.status(404).json({ message: 'Account not found. Please register first.' });
      }
      
      // Perform automatic registration (signup action)
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 12);

      if (role === 'InstituteAdmin') {
        const details = registrationDetails || {};

        const legalName = details.legalName || `${name}'s Legal Entity`;
        const brandName = details.brandName || `${name}'s Institute`;
        const phoneNumber = details.phoneNumber || "000-000-0000";
        const address = details.address || "Registered via Single Sign-On Gateway";

        user = new User({
          name,
          email,
          password: dummyPassword,
          role: 'InstituteAdmin',
          status: 'Approved',
          instituteId: null
        });
        await user.save();

        const institute = new Institute({
          name: brandName,
          legalName,
          brandName,
          phoneNumber,
          address,
          email,
          adminId: user._id,
          status: 'Active',
          billingPlan: details.billingPlan || 'Basic',
          walletBalance: Number(details.amountPaid) || 0
        });
        await institute.save();

        if (Number(details.amountPaid) > 0) {
          const transaction = new Transaction({
            instituteId: institute._id,
            amount: Number(details.amountPaid),
            type: 'Recharge',
            description: `Initial registration payment for ${details.billingPlan || 'Basic'} Plan`,
            promoCode: details.promoCode || null,
            razorpayPaymentId: details.razorpay_payment_id,
            razorpayOrderId: details.razorpay_order_id,
          });
          await transaction.save();
        }

        user.instituteId = institute._id as any;
        await user.save();
      } else {
        // For Faculty and Student, they start Pending
        const details = registrationDetails || {};
        const instituteId = details.instituteId;

        if (!instituteId) {
          return res.status(400).json({ message: "An institute selection is required to register." });
        }

        const isFaculty = role === 'Faculty';
        user = new User({
          name,
          email,
          password: dummyPassword,
          role,
          status: (instituteId && !isFaculty) ? 'Pending' : 'Approved',
          affiliationStatus: (instituteId && isFaculty) ? 'Pending' : 'Unaffiliated',
          instituteId: instituteId,
          phoneNumber: details.phoneNumber,
          address: details.address
        });
        await user.save();
      }
    }

    // Generate JWT for approved/active/pending users
    const jwtSecret = process.env.JWT_SECRET || 'super_fallback_jwt_secret_lumenlms';
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        status: user.status
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'OAuth Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        status: user.status,
        picture: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
      }
    });
  } catch (error: any) {
    console.error('OAuth Login error:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

export const superCodeLogin = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Please provide the Super Access Code.' });
    }

    const envSuperCode = process.env.SUPER_CODE;
    if (!envSuperCode) {
      return res.status(500).json({ message: 'Super Access Code is not configured on the server.' });
    }

    if (code !== envSuperCode) {
      return res.status(401).json({ message: 'Invalid Super Access Code.' });
    }

    // Find the seeded SuperAdmin user
    const user = await User.findOne({ role: 'SuperAdmin' });
    if (!user) {
      return res.status(404).json({ message: 'Super Admin account has not been seeded yet.' });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'super_fallback_jwt_secret_lumenlms';
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: null,
        status: user.status
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Super Admin authentication successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'super', // Frontend expects "super"
        status: user.status,
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
      }
    });
  } catch (error: any) {
    console.error('Super Code Login error:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

export const getActiveInstitutes = async (req: Request, res: Response) => {
  try {
    const activeInstitutes = await Institute.find({ status: "Active" }, "_id name brandName legalName address");
    return res.status(200).json(activeInstitutes);
  } catch (error: any) {
    console.error("Get active institutes error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const updateInstitute = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { instituteId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.role === 'InstituteAdmin') {
      return res.status(403).json({ message: "Institute Admins cannot change their primary institute." });
    }

    // Set instituteId or clear it if it's null/'none'
    if (!instituteId || instituteId === 'none') {
      return res.status(400).json({ message: "An institute selection is required." });
    } else {
      user.instituteId = instituteId;
      if (user.role === 'Faculty') {
        user.affiliationStatus = 'Pending';
        user.status = 'Approved'; // Faculty account remains active but affiliation is pending
      } else {
        user.status = 'Pending'; // Student needs new approval from new institute
      }
    }

    await user.save();

    res.status(200).json({ 
      message: "Affiliated institute updated.", 
      instituteId: user.instituteId, 
      status: user.status,
      affiliationStatus: user.affiliationStatus 
    });
  } catch (error: any) {
    console.error("updateInstitute error:", error);
    res.status(500).json({ message: "Failed to update institute." });
  }
};

export const getPendingFacultyAffiliations = async (req: any, res: Response) => {
  try {
    const adminId = req.user.id;
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "InstituteAdmin") {
      return res.status(403).json({ message: "Access denied: Only Institute Admins can view pending faculty." });
    }

    const pendingFaculty = await User.find({
      instituteId: admin.instituteId,
      role: "Faculty",
      affiliationStatus: "Pending"
    }).select("name email phoneNumber address status affiliationStatus");

    return res.status(200).json(pendingFaculty);
  } catch (error: any) {
    console.error("getPendingFacultyAffiliations error:", error);
    return res.status(500).json({ message: "Failed to retrieve pending faculty affiliations." });
  }
};

export const updateFacultyAffiliation = async (req: any, res: Response) => {
  try {
    const adminId = req.user.id;
    const { facultyId, action } = req.body; // action: "approve" | "reject"

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "InstituteAdmin") {
      return res.status(403).json({ message: "Access denied." });
    }

    if (!facultyId || !action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid parameters." });
    }

    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== "Faculty" || faculty.instituteId?.toString() !== admin.instituteId?.toString()) {
      return res.status(404).json({ message: "Faculty member not found under your institute." });
    }

    if (action === "approve") {
      faculty.affiliationStatus = "Approved";
    } else {
      faculty.affiliationStatus = "Unaffiliated";
      faculty.instituteId = null;
    }

    await faculty.save();

    return res.status(200).json({
      message: `Faculty affiliation request has been successfully ${action === "approve" ? "approved" : "rejected"}.`,
      faculty
    });
  } catch (error: any) {
    console.error("updateFacultyAffiliation error:", error);
    return res.status(500).json({ message: "Failed to update faculty affiliation." });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, phoneNumber, address } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({ 
      message: "Profile updated successfully.", 
      user: { name: user.name, phoneNumber: user.phoneNumber, address: user.address }
    });
  } catch (error: any) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("instituteId");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userObj = user.toObject() as any;
    if (userObj.instituteId) {
      const inst = userObj.instituteId as any;
      userObj.isZoomConfigured = !!(inst.zoomAccountId && inst.zoomClientId && inst.zoomClientSecret);
      // Remove Zoom credentials from user profile payload for security
      delete inst.zoomAccountId;
      delete inst.zoomClientId;
      delete inst.zoomClientSecret;
    } else {
      userObj.isZoomConfigured = false;
    }

    return res.status(200).json(userObj);
  } catch (error: any) {
    console.error("getMe error:", error);
    return res.status(500).json({ message: "Failed to fetch user details." });
  }
};

export const getPublicPlans = async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find().sort({ maxStudents: 1 });
    return res.status(200).json(plans);
  } catch (error: any) {
    console.error("Error fetching public plans:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const validatePromoCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Promo code is required." });
    }

    const promo = await PromoCode.findOne({ code: code.toUpperCase() });
    if (!promo) {
      return res.status(404).json({ message: "Invalid promo code." });
    }
    if (!promo.isActive) {
      return res.status(400).json({ message: "This promo code is no longer active." });
    }

    return res.status(200).json({ message: "Promo code applied successfully!", discountPercentage: promo.discountPercentage });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const createOnboardingOrder = async (req: Request, res: Response) => {
  try {
    const { promoCode } = req.body;
    let amountToCharge = 500; // base price in INR

    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase(), isActive: true });
      if (promo) {
        const discountAmount = (amountToCharge * promo.discountPercentage) / 100;
        amountToCharge = amountToCharge - discountAmount;
      }
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    const options = {
      amount: Math.round(amountToCharge * 100), 
      currency: "INR",
      receipt: `rcpt_onboard_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ message: "Error creating Razorpay order" });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error("Razorpay onboarding order error:", error);
    return res.status(500).json({ message: "Failed to create onboarding payment order." });
  }
};
