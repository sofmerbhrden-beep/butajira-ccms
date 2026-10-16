import cron from "node-cron";
import Application from "../models/Application.js";
import { sendStatusEmail } from "../utils/mailer.js";

export const initCronJobs = () => {
  cron.schedule("0 2 * * *", async () => {
    console.log("Running nightly certificate expiration check...");
    
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const expiredApps = await Application.find({
        status: "certificate_generated",
        "certificate.issuedAt": { $lt: oneYearAgo }
      });

      for (const app of expiredApps) {
        app.status = "expired";
        await app.save();

        const applicantEmail = app.applicantInfo?.address?.email;
        if (applicantEmail) {
          await sendStatusEmail(
            applicantEmail,
            app.applicantInfo.fullName,
            "expired",
            app.certificate.referenceNumber,
            "Your competency certificate has expired. Please apply for a renewal through the system."
          ).catch(() => {});
        }
      }

      console.log(`Expiration check complete. Marked ${expiredApps.length} certificates as expired.`);
    } catch (error) {
      console.error("Error running expiration cron job:", error);
    }
  });
};
