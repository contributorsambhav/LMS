import cron from "node-cron";
import { Institute } from "../models/Institute";
import { Plan } from "../models/Plan";
import { Transaction } from "../models/Transaction";

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
        acc[plan.planCode] = price;
        return acc;
      }, {});

      for (const institute of activeInstitutes) {
        const planPrice = planMap[institute.billingPlan] || 0;
        if (planPrice === 0) continue; // Custom plans might be handled manually

        const dailyRate = planPrice / 28;

        if (institute.walletBalance > 0) {
          // Has balance
          institute.walletBalance -= dailyRate;
          institute.negativeDaysCount = 0;
          await institute.save();
          
          await Transaction.create({
            instituteId: institute._id,
            amount: -dailyRate,
            type: "Daily Deduction",
            description: `Daily burn for ${institute.billingPlan} Plan`
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
