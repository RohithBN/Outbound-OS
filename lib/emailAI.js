export async function generateEmail({ name, role, company, goal, score, signals }) {
  // Extract goal details
  const objectiveType = goal?.objective_type || 'hiring';
  const criteria = goal?.criteria || {};
  
  // Create personalized subject based on objective
  let subject = '';
  if (objectiveType === 'hiring') {
    subject = `Exciting opportunity at ${criteria.company_name || 'our company'}`;
  } else if (objectiveType === 'sales') {
    subject = `Quick question about ${company}`;
  } else {
    subject = `Partnership opportunity for ${name}`;
  }
  
  // Generate personalized intro based on signals
  const signalMentions = signals?.slice(0, 2).join(' and ') || 'your experience';
  
  // Craft body based on objective type
  let bodyContent = '';
  
  if (objectiveType === 'hiring') {
    bodyContent = `
      <p>Hi ${name},</p>
      <p>I came across your profile and was impressed by ${signalMentions}. Your experience as a ${role}${company ? ` at ${company}` : ''} aligns perfectly with what we're looking for.</p>
      <p>We're currently ${goal?.raw_input || 'hiring talented engineers'}, and I believe you'd be a great fit for our team. Your skills in ${criteria.skills?.slice(0, 2).join(' and ') || 'your field'} are exactly what we need.</p>
      <p>Would you be interested in learning more about this opportunity? I'd love to schedule a quick 15-minute call to discuss how this role could be a great next step in your career.</p>
      <p>Looking forward to hearing from you!</p>
      <p>Best regards,<br/>The Hiring Team</p>
    `;
  } else if (objectiveType === 'sales') {
    bodyContent = `
      <p>Hi ${name},</p>
      <p>I noticed ${signalMentions} and thought you might be interested in what we're building.</p>
      <p>We're working on ${goal?.raw_input || 'innovative solutions'} that could benefit ${company || 'your organization'}.</p>
      <p>Would you be open to a quick 10-minute call to explore if there's a fit?</p>
      <p>Best,<br/>Sales Team</p>
    `;
  } else {
    bodyContent = `
      <p>Hi ${name},</p>
      <p>I came across your work on ${signalMentions} and was really impressed.</p>
      <p>${goal?.raw_input || 'We are exploring partnership opportunities'} and I think there could be great synergy between us.</p>
      <p>Would you be interested in exploring a potential collaboration?</p>
      <p>Best regards,<br/>Partnership Team</p>
    `;
  }
  
  return {
    subject,
    body: bodyContent
  };
}
