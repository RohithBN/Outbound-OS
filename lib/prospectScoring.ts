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
Return ONLY a JSON array.

Job Requirements:
`;

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function batchScoreProspects(
  criteria: ParsedCriteria,
  prospects: ProspectScoringInput[]
): Promise<ScoringResult[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const jobRequirements = {
      role: criteria.role,
      location: criteria.location,
      experience: criteria.experience,
      required_skills: criteria.skills,
      industry: criteria.industry,
    };

    const candidateProfiles = prospects.map((p) => ({
      login: p.login,
      name: p.name,
      bio: p.bio,
      location: p.location,
      company: p.company,
      followers: p.followers,
      public_repos: p.public_repos,
      github_url: p.github_url,
      top_repositories: p.repositories.slice(0, 5).map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stars,
        topics: r.topics?.slice(0, 3),
      })),
      activity_summary: p.contributions
        ? {
            total_events: p.contributions.total_events,
            push_events: p.contributions.event_breakdown.PushEvent || 0,
            pr_events: p.contributions.event_breakdown.PullRequestEvent || 0,
          }
        : null,
    }));

    const chunks = chunkArray(candidateProfiles, 5);
    let allResults: ScoringResult[] = [];

    for (const chunk of chunks) {
      try {
        const prompt =
          BATCH_SCORING_PROMPT +
          JSON.stringify(jobRequirements, null, 2) +
          "\n\nCandidate Profiles:\n" +
          JSON.stringify(chunk, null, 2);

        console.log(`Scoring chunk of ${chunk.length} candidates...`);

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\[[\s\S]*\]/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);

        const chunkResults: ScoringResult[] = parsed.map((r: any) => ({
          login: r.login || "",
          score: Math.max(0, Math.min(10, r.score || 5)),
          reasoning: r.reasoning || "No reasoning provided",
          signals: r.signals || [],
          strengths: r.strengths || [],
          concerns: r.concerns || [],
        }));

        allResults.push(...chunkResults);

        await new Promise((r) => setTimeout(r, 1200));
      } catch (err) {
        console.error("Chunk scoring failed:", err);

        allResults.push(
          ...chunk.map((p: any) => ({
            login: p.login,
            score: 5,
            reasoning: "Fallback score due to API issue",
            signals: ["scoring_failed"],
            strengths: [],
            concerns: [],
          }))
        );
      }
    }

    return allResults;
  } catch (error) {
    console.error("Batch scoring fatal error:", error);

    return prospects.map((p) => ({
      login: p.login,
      score: 5,
      reasoning: "Global fallback score",
      signals: ["scoring_failed"],
      strengths: [],
      concerns: [],
    }));
  }
}
