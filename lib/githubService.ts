import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface GitHubUser {
  login: string;
  id: number;
  name: string | null;
  email: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubSearchResult {
  users: GitHubUser[];
  total_count: number;
}

export async function searchDevelopers(
  skills: string[],
  location?: string,
  limit: number = 30
): Promise<GitHubSearchResult> {
  try {
    // Build search query
    const queryParts: string[] = [];
    
    // Add skills/languages
    if (skills && skills.length > 0) {
      skills.forEach(skill => {
        queryParts.push(`language:${skill}`);
      });
    }
    
    // Add location
    if (location) {
      queryParts.push(`location:"${location}"`);
    }
    
    // Add filters for active users
    queryParts.push('type:user');
    queryParts.push('followers:>=10');
    queryParts.push('repos:>=5');
    
    const query = queryParts.join(' ');
    
    // Search for users
    const response = await octokit.search.users({
      q: query,
      per_page: Math.min(limit, 100),
      sort: 'followers',
      order: 'desc',
    });
    
    // Get detailed info for each user
    const userPromises = response.data.items.map(async (user:any) => {
      try {
        const userDetail = await octokit.users.getByUsername({
          username: user.login,
        });
        return userDetail.data as GitHubUser;
      } catch (error) {
        console.error(`Error fetching user ${user.login}:`, error);
        return null;
      }
    });
    
    const users = (await Promise.all(userPromises)).filter(u => u !== null) as GitHubUser[];
    
    return {
      users,
      total_count: response.data.total_count,
    };
  } catch (error) {
    console.error('GitHub search error:', error);
    throw new Error('Failed to search GitHub users');
  }
}

export async function getUserRepositories(username: string) {
  try {
    const response = await octokit.repos.listForUser({
      username,
      per_page: 10,
      sort: 'updated',
      direction: 'desc',
    });
    
    return response.data.map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      topics: repo.topics,
      updated_at: repo.updated_at,
    }));
  } catch (error) {
    console.error(`Error fetching repos for ${username}:`, error);
    return [];
  }
}

export async function getUserContributions(username: string) {
  try {
    const response = await octokit.activity.listPublicEventsForUser({
      username,
      per_page: 100,
    });
    
    const eventTypes = response.data.reduce((acc, event) => {
      if (event.type) {
        acc[event.type] = (acc[event.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total_events: response.data.length,
      event_breakdown: eventTypes,
      recent_activity: response.data.slice(0, 10).map(e => ({
        type: e.type,
        repo: e.repo.name,
        created_at: e.created_at,
      })),
    };
  } catch (error) {
    console.error(`Error fetching contributions for ${username}:`, error);
    return null;
  }
}
