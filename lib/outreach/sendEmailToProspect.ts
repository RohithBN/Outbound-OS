import { sendEmail } from "@/lib/email";
import { generateEmail } from "@/lib/emailAI";

export async function sendEmailToProspect(prospect: {
  name: string;
  email: string;
  title?: string;
  company?: string;
}) {
  const emailContent = await generateEmail({
    name: prospect.name,
    role: prospect.title || "Engineer",
    company: prospect.company || "your company",
  });
  console.log("➡️ Preparing email for:", prospect.email);

  await sendEmail({
    to: prospect.email,
    subject: emailContent.subject,
    html: emailContent.body,
  });
}
