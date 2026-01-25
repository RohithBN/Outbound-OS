import dbConnect from "@/lib/dbConnect";
import { interpretGoal } from "@/lib/gemini";
import { Goal, GoalStatus } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { raw_input } = await request.json();
    const userId = "user_id"; //TODO: jwt implementation

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
      user_id: userId,
      raw_input: raw_input,
      objective_type: parsedGoal.objective_type,
      criteria: parsedGoal.parsed_criteria,
      status: GoalStatus.DRAFT,
      success_metric: parsedGoal.success_metric,
      current_count: parsedGoal.current_count,
      target_count: parsedGoal.target_count,
      deadline: parsedGoal.deadline,
      salary_range:parsedGoal.salary_range
    };

    console.log(goalData)

    const goal = await Goal.create(goalData);

    return NextResponse.json(
      {
        message: "Goal created successfully",
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
    const userId = "user_id"; //TODO: jwt implementation
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    await dbConnect();

    const query: Record<string, unknown> = { user_id: userId };
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