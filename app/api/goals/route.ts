import dbConnect from "@/lib/dbConnect";
import { interpretGoal } from "@/lib/gemini";
import { getCurrentUser } from "@/lib/auth";
import { Goal, GoalStatus } from "@/models";
import { NextRequest, NextResponse } from "next/server";
import { discoverProspectsForGoal } from "@/lib/prospectDiscovery";
import { runAutomatedOutreach } from "@/lib/outreach";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { message: "Not authenticated", success: false },
        { status: 401 }
      );
    }

    const { raw_input } = await request.json();

    if (!raw_input) {
      return NextResponse.json(
        { message: "Input is required", success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    // Parse goal using Gemini
    const parsedGoal = await interpretGoal(raw_input);

    const goalData = {
      user_id: authUser.userId,
      raw_input: raw_input,
      objective_type: parsedGoal.objective_type,
      criteria: parsedGoal.parsed_criteria,
      status: GoalStatus.DRAFT,
      success_metric: parsedGoal.success_metric,
      current_count: parsedGoal.current_count,
      target_count: parsedGoal.target_count,
      deadline: parsedGoal.deadline,
      salary_range: parsedGoal.salary_range,
    };

    console.log(goalData);

    const goal = await Goal.create(goalData);

    // Trigger prospect discovery asynchronously (don't wait)
    discoverProspectsForGoal(goal).catch((error) => {
      console.error("Background prospect discovery failed:", error);
    });

    return NextResponse.json(
      {
        message:
          "Goal created successfully. Prospect discovery started in background.",
        success: true,
        goal: goal,
        interpretation: {
          confidence_score: parsedGoal.confidence_score,
          timeline_days: parsedGoal.timeline_days,
          notes: parsedGoal.interpretation_notes,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      {
        message: "Failed to create goal",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { message: "Not authenticated", success: false },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    await dbConnect();

    const query: Record<string, unknown> = { user_id: authUser.userId };
    if (status) {
      query.status = status;
    }

    const goals = await Goal.find(query).sort({ created_at: -1 });

    return NextResponse.json(
      {
        success: true,
        goals: goals,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch goals",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}