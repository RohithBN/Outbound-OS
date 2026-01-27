export async function generateEmail({ name, role, company }) {
    // MOCK AI for now — we’ll plug Claude later
    return {
      subject: `Quick question about ${company}`,
      body: `
        <p>Hi ${name},</p>
        <p>I came across your experience as a ${role} at ${company} and was really impressed.</p>
        <p>We're currently hiring engineers working on exciting AI systems and I think you'd be a great fit.</p>
        <p>Would you be open to a quick chat this week?</p>
        <p>Best,<br/>Ashitha</p>
      `
    };
  }
  