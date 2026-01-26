import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParsedCriteria } from "@/types/response";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ProspectScoringInput {
  name: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  repositories: Array<{
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    topics?: string[];
  }>;
  followers: number;
  public_repos: number;
  contributions: {
    total_events: number;
    event_breakdown: Record<string, number>;
  } | null;
  github_url: string;
  login: string;
}

export interface ScoringResult {
  login: string;
  score: number;
  reasoning: string;
  signals: string[];
  strengths: string[];
  concerns: string[];
}

const BATCH_SCORING_PROMPT = `You are an expert technical recruiter evaluating multiple developer profiles for a job opportunity.

Given a job requirement and a list of candidate profiles, score each candidate from 0-10 based on:
1. Technical skill match (languages, frameworks, technologies)
2. Experience level (based on repos, contributions, followers)
3. Location match (if specified)
4. Activity and engagement (recent contributions, repo maintenance)
5. Profile quality (bio, public presence, documentation)

Return a JSON array where each object represents one candidate with:
{
  "login": string (GitHub username),
  "score": number (0-10, where 10 is perfect match),
  "reasoning": string (2-3 sentences explaining the score),
  "signals": string[] (3-5 key indicators that influenced the score),
  "strengths": string[] (2-3 main strengths of this candidate),
  "concerns": string[] (1-2 potential concerns or missing qualifications)
}

Scoring guidelines:
- 8-10: Excellent match (highly qualified, strong technical skills, active contributor)
- 6-7: Good match (meets requirements, solid experience, some gaps)
- 4-5: Moderate match (partial fit, missing some key qualifications)
- 0-3: Poor match (doesn't meet requirements, weak profile)

Be objective, specific, and consistent across all candidates. Only return a valid JSON array.

Job Requirements:
`;

export async function batchScoreProspects(
  criteria: ParsedCriteria,
  prospects: ProspectScoringInput[]
): Promise<ScoringResult[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const jobRequirements = {
      role: criteria.role,
      location: criteria.location,
      experience: criteria.experience,
      required_skills: criteria.skills,
      company_size: criteria.company_size,
      industry: criteria.industry,
    };
    
    // Prepare simplified candidate profiles for batch scoring
    const candidateProfiles = prospects.map(p => ({
      login: p.login,
      name: p.name,
      bio: p.bio,
      location: p.location,
      current_company: p.company,
      followers: p.followers,
      public_repos: p.public_repos,
      github_url: p.github_url,
      top_repositories: p.repositories.slice(0, 5).map(r => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stars,
        topics: r.topics?.slice(0, 3),
      })),
      activity_summary: p.contributions ? {
        total_events: p.contributions.total_events,
        push_events: p.contributions.event_breakdown.PushEvent || 0,
        pr_events: p.contributions.event_breakdown.PullRequestEvent || 0,
      } : null,
    }));
    
    const prompt = BATCH_SCORING_PROMPT + 
      JSON.stringify(jobRequirements, null, 2) +
      "\n\nCandidate Profiles to Score:\n" +
      JSON.stringify(candidateProfiles, null, 2);
    
    console.log(`Sending ${prospects.length} candidates for batch scoring...`);
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON array from response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                     response.match(/```\s*([\s\S]*?)\s*```/) ||
                     response.match(/\[[\s\S]*\]/);
    
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    const parsed = JSON.parse(jsonString.trim());
    
    // Ensure we have an array and validate scores
    const results = Array.isArray(parsed) ? parsed : [parsed];
    
    return results.map(r => ({
      login: r.login || "",
      score: Math.max(0, Math.min(10, r.score || 5)),
      reasoning: r.reasoning || "No reasoning provided",
      signals: r.signals || [],
      strengths: r.strengths || [],
      concerns: r.concerns || [],
    }));
  } catch (error) {
    console.error('Error in batch scoring:', error);
    // Return default scores if AI fails
    return prospects.map(p => ({
      login: p.login,
      score: 5,
      reasoning: "Unable to score automatically, manual review recommended",
      signals: ["automatic_scoring_failed"],
      strengths: [],
      concerns: ["AI scoring unavailable"],
    }));
  }
}

// Keep the single scoring function for backward compatibility or manual scoring
export async function scoreProspect(
  criteria: ParsedCriteria,
  prospect: ProspectScoringInput
): Promise<ScoringResult> {
  const results = await batchScoreProspects(criteria, [prospect]);
  return results[0];
}
