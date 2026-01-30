import dbConnect from "@/lib/dbConnect";
import { sendEmail } from "@/lib/email";
import { generateEmail } from "@/lib/emailAI";
import Prospect, { IProspect } from "@/models/Prospect";
import Goal from "@/models/Goal";
import Email from "@/models/Email";

export async function sendEmailToProspect(prospect: IProspect) {
  try {
    await dbConnect();

    if (!prospect.email) {
      console.log(`⚠️ Prospect ${prospect.name} has no email. Skipping.`);
      return;
    }

    console.log("➡️ Generating email for:", prospect.email);

    const emailContent = await generateEmail({
      name: prospect.name,
      role: prospect.title || "Engineer",
      company: prospect.company || "your company",
    });

    console.log("📤 Sending email via Resend...");

    const resendResponse = await sendEmail({
      to: prospect.email,
      subject: emailContent.subject,
      html: emailContent.body,
    });

    // ✅ Properly handle Resend response
    if (!resendResponse?.data?.id) {
      throw new Error(resendResponse?.error?.message || "Resend failed");
    }

    console.log("✅ Email sent. ID:", resendResponse.data.id);

    // 📝 Log successful outbound email
    await Email.create({
      goal_id: prospect.goal_id,
      prospect_id: prospect._id,
      to: prospect.email,
      subject: emailContent.subject,
      body: emailContent.body,
      direction: "outbound",
      status: "sent",
    });

    // 🔄 Update prospect outreach status
    await Prospect.findByIdAndUpdate(prospect._id, {
      outreach_status: "sent",
      updated_at: new Date(),
    });

    // 📊 Update goal campaign metrics
    await Goal.findByIdAndUpdate(prospect.goal_id, {
      $inc: { emails_sent: 1 },
    });

  } catch (error) {
    console.error("❌ Email sending failed:", error);

    // 📝 Log failed email attempt
    await Email.create({
      goal_id: prospect.goal_id,
      prospect_id: prospect._id,
      to: prospect.email,
      subject: "Outreach Attempt Failed",
      direction: "outbound",
      status: "failed",
    });

    await Prospect.findByIdAndUpdate(prospect._id, {
      outreach_status: "not_sent",
      updated_at: new Date(),
    });
  }
}
