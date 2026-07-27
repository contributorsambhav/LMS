import cron from "node-cron";
import { Institute } from "../models/Institute";
import { Plan } from "../models/Plan";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";

export const startBillingCron = () => {
  // Run every day at midnight (00:00)
  cron.schedule("0 0 * * *", async () => {
    console.log("[Billing Cron] Starting daily wallet deduction...");
    try {
      const activeInstitutes = await Institute.find({ status: "Active" });
      const plans = await Plan.find({});
      const planMap = plans.reduce((acc: any, plan) => {
        // Extract numeric price from strings like "₹599/mo"
        const numMatch = plan.price.match(/\d+/g);
        let price = 0;
        if (numMatch) {
          price = parseInt(numMatch.join(''), 10);
        }
        acc[plan.planCode] = { price, maxStorageGB: plan.maxStorageGB, maxStudents: plan.maxStudents };
        return acc;
      }, {});

      for (const institute of activeInstitutes) {
        const planDetails = planMap[institute.billingPlan];
        if (!planDetails || planDetails.price === 0) continue; // Custom plans might be handled manually

        let dailyRate = planDetails.price / 28;

        // Check for usage overages
        const userCount = await User.countDocuments({ role: { $in: ["Student", "Faculty"] }, instituteId: institute._id });
        const totalUserCount = userCount + 1; // +1 for the Institute Admin
        const totalStorageBytes = (institute.storageUsage?.videoBytes || 0) + (institute.storageUsage?.documentBytes || 0);
        const totalStorageGB = totalStorageBytes / (1024 * 1024 * 1024);

        let overagePenalty = false;
        let overageReason = "";
        
        if (totalUserCount > planDetails.maxStudents) {
          overagePenalty = true;
          overageReason = `User count exceeded (${totalUserCount}/${planDetails.maxStudents}). `;
        }
        if (totalStorageGB > planDetails.maxStorageGB) {
          overagePenalty = true;
          overageReason += `Storage exceeded (${totalStorageGB.toFixed(2)}GB/${planDetails.maxStorageGB}GB).`;
        }

        if (overagePenalty) {
          dailyRate = dailyRate * 2; // Double cost at midnight for exceeding plan
          institute.overageDaysCount = (institute.overageDaysCount || 0) + 1;
          
          if (institute.overageDaysCount > 30) {
            console.log(`[Billing Cron] Suspending Institute due to 30 days of overage: ${institute._id}`);
            institute.status = "Suspended";
          }
        } else {
          institute.overageDaysCount = 0;
        }

        if (institute.walletBalance > 0) {
          // Has balance
          institute.walletBalance -= dailyRate;
          institute.negativeDaysCount = 0;
          await institute.save();
          
          await Transaction.create({
            instituteId: institute._id,
            amount: -dailyRate,
            type: overagePenalty ? "Penalty" : "Daily Deduction",
            description: overagePenalty 
              ? `Overage Penalty 2x rate applied: ${overageReason}` 
              : `Daily burn for ${institute.billingPlan} Plan`
          });
        } else {
          // In negative balance -> double charge penalty
          const penalty = dailyRate * 2;
          institute.walletBalance -= penalty;
          institute.negativeDaysCount += 1;
          
          if (institute.negativeDaysCount > 7) {
            console.log(`[Billing Cron] Suspending Institute: ${institute._id}`);
            institute.status = "Suspended";
          }
          await institute.save();
          
          await Transaction.create({
            instituteId: institute._id,
            amount: -penalty,
            type: "Penalty",
            description: `Penalty for negative balance (${institute.billingPlan} Plan)`
          });
        }
      }
      console.log("[Billing Cron] Completed successfully.");
    } catch (error) {
      console.error("[Billing Cron] Error executing daily deduction:", error);
    }
  });
};
