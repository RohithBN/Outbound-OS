import { sendEmail } from "@/lib/email";
import { generateEmail } from "@/lib/emailAI";
import { IGoal } from "@/models";

export async function sendEmailToProspect(
  prospect: {
    _id: any;
    name: string;
    email: string;
    title?: string;
    company?: string;
    ai_score: number;
    signals: string[];
  },
  goal: IGoal
) {
  const emailContent = await generateEmail({
    name: prospect.name,
    role: prospect.title || "Engineer",
    company: prospect.company || "your company",
    goal: {
      objective_type: goal.objective_type,
      raw_input: goal.raw_input,
      criteria: goal.criteria,
    },
    score: prospect.ai_score,
    signals: prospect.signals,
  });
  
  console.log("➡️ Preparing email for:", prospect.email);

  await sendEmail({
    to: prospect.email,
    subject: emailContent.subject,
    html: emailContent.body,
  });
}
