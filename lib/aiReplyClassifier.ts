import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function classifyReply(reply: string) {
  const prompt = `
Classify this email reply into ONE of these categories:
- interested
- not_now
- not_interested

Reply:
"${reply}"

Return ONLY the category word.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().toLowerCase();

  if (text.includes("interested")) return "interested";
  if (text.includes("not_now")) return "not_now";
  return "not_interested";
}
