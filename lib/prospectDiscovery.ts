import {
  searchDevelopers,
  getUserRepositories,
  getUserContributions,
  GitHubUser,
} from "./githubService";
import { batchScoreProspects, ProspectScoringInput } from "./prospectScoring";
import { Prospect, IGoal } from "@/models";
import { ParsedCriteria } from "@/types/response";
import dbConnect from "./dbConnect";
import { sendEmailToProspect } from "@/lib/outreach/sendEmailToProspect";

export interface DiscoveryResult {
  total_discovered: number;
  total_scored: number;
  top_prospects: Array<{
    name: string;
    score: number;
    github_url: string;
  }>;
}

export async function discoverProspectsForGoal(
  goal: IGoal
): Promise<DiscoveryResult> {
  try {
    await dbConnect();

    const criteria = goal.criteria as ParsedCriteria;
    const targetCount = goal.target_count * 2;

    console.log(`Starting prospect discovery for goal ${goal._id}`);
    console.log(`Target: ${targetCount} prospects`);

    const skills = criteria.skills || [];
    const location = criteria.location;

    const searchResult = await searchDevelopers(skills, location, targetCount);
    console.log(`Found ${searchResult.users.length} users from GitHub`);

    if (searchResult.users.length === 0) {
      return {
        total_discovered: 0,
        total_scored: 0,
        top_prospects: [],
      };
    }

    const prospectsWithData: Array<{
      user: GitHubUser;
      scoringInput: ProspectScoringInput;
    }> = [];

    console.log("Fetching repository and contribution data...");

    for (const user of searchResult.users) {
      try {
        const repos = await getUserRepositories(user.login);
        const contributions = await getUserContributions(user.login);

        const scoringInput: ProspectScoringInput = {
          name: user.name || user.login,
          login: user.login,
          bio: user.bio,
          location: user.location,
          company: user.company,
          repositories: repos.map((repo) => ({
            name: repo.name,
            description: repo.description,
            language: repo.language || null,
            stars: repo.stars || 0,
            topics: repo.topics,
          })),
          followers: user.followers,
          public_repos: user.public_repos,
          contributions,
          github_url: user.html_url,
        };

        prospectsWithData.push({ user, scoringInput });

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing user ${user.login}:`, error);
      }
    }

    console.log(`Collected data for ${prospectsWithData.length} users`);

    const scoringInputs = prospectsWithData.map((p) => p.scoringInput);
    const scoringResults = await batchScoreProspects(criteria, scoringInputs);

    const scoresMap = new Map(
      scoringResults.map((result) => [result.login, result])
    );

    const scoredProspects = prospectsWithData
      .map(({ user }) => {
        const scoringResult = scoresMap.get(user.login) || {
          login: user.login,
          score: 5,
          reasoning: "Default score",
          signals: [],
        };

        return {
          user,
          score: scoringResult.score,
          reasoning: scoringResult.reasoning,
          signals: scoringResult.signals,
        };
      })
      .sort((a, b) => b.score - a.score);

    console.log(`Scored ${scoredProspects.length} prospects`);

    // SAVE PROSPECTS
    const savedProspects = [];

    for (const prospect of scoredProspects) {
      try {
        const email =
          prospect.user.email || `${prospect.user.login}@github.com`;

        const prospectData = {
          goal_id: goal._id,
          source: "github",
          source_id: prospect.user.id.toString(),
          name: prospect.user.name || prospect.user.login,
          email: email,
          title: criteria.role || "Developer",
          company: prospect.user.company || "Unknown",
          location: prospect.user.location || "Unknown",
          github_url: prospect.user.html_url,
          profile_data: {
            bio: prospect.user.bio,
            followers: prospect.user.followers,
            following: prospect.user.following,
            public_repos: prospect.user.public_repos,
            created_at: prospect.user.created_at,
            blog: prospect.user.blog,
          },
          ai_score: prospect.score,
          score_reasoning: prospect.reasoning,
          signals: prospect.signals,
        };

        const saved = await Prospect.findOneAndUpdate(
          { goal_id: goal._id, email: email },
          prospectData,
          { upsert: true, new: true }
        );

        if (saved) savedProspects.push(saved);
      } catch (error) {
        console.error(`Error saving prospect ${prospect.user.login}:`, error);
      }
    }

    console.log(`Saved ${savedProspects.length} prospects`);

    // 🚀 AUTOMATED OUTREACH
    const topProspectsForEmail = savedProspects
      .sort((a, b) => b.ai_score - a.ai_score)
      .slice(0, 5);

    for (const prospect of topProspectsForEmail) {
      try {
        if (!prospect.email) {
          console.log(`Skipping ${prospect.name}, no email`);
          continue;
        }

        await sendEmailToProspect(prospect);
        console.log(`📧 Email has been sent to ${prospect.name}`);
      } catch (err) {
        console.error(`❌ Failed email to ${prospect.email}`, err);
      }
    }

    return {
      total_discovered: searchResult.users.length,
      total_scored: scoredProspects.length,
      top_prospects: scoredProspects.slice(0, 10).map((p) => ({
        name: p.user.name || p.user.login,
        score: p.score,
        github_url: p.user.html_url,
      })),
    };
  } catch (error) {
    console.error("Prospect discovery error:", error);
    throw error;
  }
}
