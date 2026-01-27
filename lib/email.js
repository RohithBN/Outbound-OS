import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  return await resend.emails.send({
    from: "Outbound OS <onboarding@resend.dev>", // demo sender
    to,
    subject,
    html
  });
}
