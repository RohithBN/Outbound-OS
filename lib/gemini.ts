import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiGoalCreationResponse } from "@/types/response";
import { ObjectiveType } from "@/models/enums";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const GOAL_INTERPRETER_PROMPT = `You are a goal interpreter for an outbound sales/recruiting platform. 
Your task is to parse natural language goals into structured parameters.

Given a user's goal statement, extract and return a JSON object with the following structure:
{
  "objective_type": "hiring" | "sales" | "partnership",
  "target_count": number (how many outcomes desired),
  "current_count": 0,
  "parsed_criteria": {
    "role": string (job title or target persona),
    "location": string (geographic location if mentioned),
    "experience": string (experience level if mentioned),
    "skills": string[] (relevant skills if mentioned),
    "company_size": string (if mentioned),
    "industry": string (if mentioned)
  },
  "timeline_days": number (number of days, default 30 if not specified),
  "success_metric": string (what counts as success: "response" | "meeting" | "hire" | "sale" | "accepted_offer" | "partnership_signed"),
  "confidence_score": number (0-1, how confident you are in the interpretation),
  "salary_range":string( Only if salary is mentioned.)
  "interpretation_notes": string (any clarifications or assumptions made)
}

Rules:
1. If objective involves hiring/recruiting, set objective_type to "hiring"
2. If objective involves selling/revenue/customers, set objective_type to "sales"
3. If objective involves partnerships/collaborations, set objective_type to "partnership"
4. Extract all relevant criteria from the input
5. If timeline not specified, default to 30 days
6. Choose the most appropriate success_metric based on context
7. Only return valid JSON, no additional text

User Goal: `;

export async function interpretGoal(rawInput: string): Promise<GeminiGoalCreationResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = GOAL_INTERPRETER_PROMPT + rawInput;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Extract JSON from the response (handle potential markdown code blocks)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
  const jsonString = jsonMatch ? jsonMatch[1] : text;

  const parsed = JSON.parse(jsonString.trim());

  // Calculate deadline from timeline_days
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + (parsed.timeline_days || 30));

  // Validate and normalize objective_type
  const validObjectiveTypes = Object.values(ObjectiveType);
  const objectiveType = validObjectiveTypes.includes(parsed.objective_type)
    ? parsed.objective_type
    : ObjectiveType.SALES;

  return {
    objective_type: objectiveType,
    target_count: parsed.target_count || 1,
    current_count: 0,
    parsed_criteria: parsed.parsed_criteria || {},
    timeline_days: parsed.timeline_days || 30,
    deadline: deadline,
    success_metric: parsed.success_metric || "response",
    confidence_score: parsed.confidence_score || 0.8,
    salary_range:parsed.salary_range,
    interpretation_notes: parsed.interpretation_notes,
  };
}
