import { sendEmail } from "@/lib/email";

export async function sendAssignmentEmail(prospect: any) {
  const assignmentLink = `https://worktrial.ai/test/${prospect._id}`;

  await sendEmail({
    to: prospect.email,
    subject: "Next Step: Technical Assignment",
    html: `
      <p>Hi ${prospect.name},</p>
      <p>Thanks for your interest! Please complete this short assessment:</p>
      <a href="${assignmentLink}">Start Assignment</a>
      <p>Looking forward to your submission.</p>
    `,
  });
}
