import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import TalentProfile from "@/models/TalentProfile";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      email,
      name,
      role,
      location,
      experience_years,
      skills,
      bio,
      linkedin_url,
      github_url,
      portfolio_url,
      current_company,
      expected_salary_min,
      expected_salary_max,
      work_authorization,
      remote_preference,
      availability,
      preferred_company_size,
      preferred_industries,
      open_to_relocation,
    } = data;

    // Validation
    if (!email || !name || !role || !location || experience_years === undefined || 
        !skills || !bio || !work_authorization || !remote_preference || !availability) {
      return NextResponse.json(
        { message: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if profile already exists
    const existing = await TalentProfile.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { message: "Profile with this email already exists", success: false },
        { status: 409 }
      );
    }

    // Create talent profile
    const talentProfile = await TalentProfile.create({
      email: email.toLowerCase(),
      name,
      role,
      location,
      experience_years,
      skills: Array.isArray(skills) ? skills : [skills],
      bio,
      linkedin_url,
      github_url,
      portfolio_url,
      current_company,
      expected_salary_min,
      expected_salary_max,
      work_authorization,
      remote_preference,
      availability,
      preferred_company_size: Array.isArray(preferred_company_size) ? preferred_company_size : [],
      preferred_industries: Array.isArray(preferred_industries) ? preferred_industries : [],
      open_to_relocation: open_to_relocation || false,
    });

    return NextResponse.json(
      {
        message: "Profile created successfully! You'll be prioritized in job matches.",
        success: true,
        profile: {
          id: talentProfile._id,
          email: talentProfile.email,
          name: talentProfile.name,
          role: talentProfile.role,
          profile_completeness: talentProfile.profile_completeness,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Talent registration error:", error);
    return NextResponse.json(
      {
        message: "Failed to create profile",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
