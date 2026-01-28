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
import TalentProfile from "@/models/TalentProfile";

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
    const totalTargetCount = goal.target_count * 2;
    
    // Calculate 60/40 split
    const talentPoolTarget = Math.ceil(totalTargetCount * 0.6); // 60% from talent pool
    const githubTarget = Math.floor(totalTargetCount * 0.4);     // 40% from GitHub

    console.log(`Starting prospect discovery for goal ${goal._id}`);
    console.log(`Total target: ${totalTargetCount} | Talent pool: ${talentPoolTarget} | GitHub: ${githubTarget}`);

    // STEP 1: Search registered talent profiles with scoring
    const registeredTalent = await TalentProfile.find({
      status: "active",
      $or: [
        { role: { $regex: criteria.role || "", $options: "i" } },
        { skills: { $in: criteria.skills || [] } }
      ],
      ...(criteria.location && { 
        location: { $regex: criteria.location, $options: "i" } 
      })
    }).limit(talentPoolTarget * 2); // Get extra to score and filter

    console.log(`Found ${registeredTalent.length} registered talent profiles for scoring`);

    // Score talent pool candidates
    const scoredTalentPool = registeredTalent.map(talent => {
      let score = 5.0; // Base score
      
      // Role match scoring
      if (criteria.role && talent.role.toLowerCase().includes(criteria.role.toLowerCase())) {
        score += 2.0;
      }
      
      // Skills match scoring
      const matchedSkills = talent.skills.filter((skill:any) => 
        criteria.skills?.some(reqSkill => 
          skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
          reqSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      score += Math.min(2.0, matchedSkills.length * 0.5);
      
      // Location match scoring
      if (criteria.location && talent.location.toLowerCase().includes(criteria.location.toLowerCase())) {
        score += 1.0;
      }
      
      // Experience level scoring
      if (criteria.experience) {
        const expYears = parseInt(criteria.experience);
        if (!isNaN(expYears) && talent.experience_years >= expYears) {
          score += 0.5;
        }
      }
      
      // Profile completeness bonus
      score += (talent.profile_completeness / 100) * 0.5;
      
      // Registered talent bonus
      score += 1.0;
      
      return {
        talent,
        score: Math.min(10, score),
        reasoning: `Registered talent: ${matchedSkills.length} skills matched, ${talent.experience_years}y exp, ${talent.profile_completeness}% complete profile`,
        signals: [
          "registered_talent",
          "active_job_seeker",
          ...matchedSkills.slice(0, 3)
        ]
      };
    });

    // Sort by score and take top candidates
    scoredTalentPool.sort((a, b) => b.score - a.score);
    const topTalentPool = scoredTalentPool.slice(0, talentPoolTarget);

    console.log(`Scored and selected top ${topTalentPool.length} talent pool candidates`);

    // Convert talent pool to prospect format
    const talentProspects = topTalentPool.map(({ talent, score, reasoning, signals }) => ({
      goal_id: goal._id,
      source: "talent_pool",
      source_id: talent._id.toString(),
      name: talent.name,
      email: talent.email,
      title: talent.role,
      company: talent.current_company || "Looking for opportunities",
      location: talent.location,
      linkedin_url: talent.linkedin_url,
      github_url: talent.github_url,
      profile_data: {
        bio: talent.bio,
        skills: talent.skills,
        experience_years: talent.experience_years,
        work_authorization: talent.work_authorization,
        availability: talent.availability,
        remote_preference: talent.remote_preference,
        profile_completeness: talent.profile_completeness,
      },
      ai_score: score,
      score_reasoning: reasoning,
      signals: signals,
    }));

    // Save talent pool prospects
    for (const prospectData of talentProspects) {
      await Prospect.findOneAndUpdate(
        { goal_id: goal._id, email: prospectData.email },
        prospectData,
        { upsert: true, new: true }
      );
    }

    // Update talent profile matched count
    await TalentProfile.updateMany(
      { _id: { $in: topTalentPool.map(t => t.talent._id) } },
      { $inc: { matched_count: 1 } }
    );

    // STEP 2: Calculate remaining count needed (with fallback logic)
    const talentPoolActual = topTalentPool.length;
    const remainingForGithub = githubTarget + (talentPoolTarget - talentPoolActual);
    
    console.log(`Talent pool provided ${talentPoolActual}/${talentPoolTarget} candidates`);
    console.log(`Searching GitHub for ${remainingForGithub} prospects to reach total target`);

    let githubProspects: Array<{
      name: string;
      score: number;
      github_url: string;
    }> = [];

    if (remainingForGithub > 0) {
      const skills = criteria.skills || [];
      const location = criteria.location;

      const searchResult = await searchDevelopers(skills, location, remainingForGithub);
      console.log(`Found ${searchResult.users.length} users from GitHub`);

      if (searchResult.users.length > 0) {
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

        console.log(`Collected data for ${prospectsWithData.length} GitHub users`);

        // Batch score GitHub prospects
        const scoringInputs = prospectsWithData.map((p) => p.scoringInput);
        const scoringResults = await batchScoreProspects(criteria, scoringInputs);

        const scoresMap = new Map(
          scoringResults.map((result) => [result.login, result])
        );

        const scoredGithubProspects = prospectsWithData
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

        console.log(`Scored ${scoredGithubProspects.length} GitHub prospects`);

        // Save GitHub prospects
        for (const prospect of scoredGithubProspects) {
          try {
            const email = prospect.user.email || `${prospect.user.login}@github.com`;

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

            await Prospect.findOneAndUpdate(
              { goal_id: goal._id, email: email },
              prospectData,
              { upsert: true, new: true }
            );
          } catch (error) {
            console.error(`Error saving prospect ${prospect.user.login}:`, error);
          }
        }

        githubProspects = scoredGithubProspects.slice(0, 10).map((p) => ({
          name: p.user.name || p.user.login,
          score: p.score,
          github_url: p.user.html_url,
        }));
      }
    }

    // Get all saved prospects for this goal
    const allProspects = await Prospect.find({ goal_id: goal._id })
      .sort({ ai_score: -1 })
      .limit(totalTargetCount);

    console.log(`Total prospects saved: ${allProspects.length} (Talent: ${talentPoolActual}, GitHub: ${allProspects.length - talentPoolActual})`);

    // AUTOMATED OUTREACH - Top 5 highest scored
    const topProspectsForEmail = allProspects
      .sort((a, b) => b.ai_score - a.ai_score)
      .slice(0, 5);

    for (const prospect of topProspectsForEmail) {
      try {
        if (!prospect.email || prospect.email.includes('@github.com')) {
          console.log(`Skipping ${prospect.name}, no valid email`);
          continue;
        }

        await sendEmailToProspect(prospect);
        console.log(`📧 Email sent to ${prospect.name} (Score: ${prospect.ai_score})`);
        
        // Update contacted count for talent pool
        if (prospect.source === 'talent_pool') {
          await TalentProfile.findByIdAndUpdate(prospect.source_id, {
            $inc: { contacted_count: 1 }
          });
        }
      } catch (err) {
        console.error(`❌ Failed email to ${prospect.email}`, err);
      }
    }

    // Combine top prospects from both sources
    const topTalentProspects = talentProspects.slice(0, 5).map((p) => ({
      name: p.name,
      score: p.ai_score,
      github_url: p.github_url || "",
    }));

    const combinedTopProspects = [...topTalentProspects, ...githubProspects]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      total_discovered: allProspects.length,
      total_scored: allProspects.length,
      top_prospects: combinedTopProspects,
    };
  } catch (error) {
    console.error("Prospect discovery error:", error);
    throw error;
  }
}
