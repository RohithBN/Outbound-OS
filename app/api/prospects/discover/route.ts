import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { Goal } from "@/models";
import { discoverProspectsForGoal } from "@/lib/prospectDiscovery";
import dbConnect from "@/lib/dbConnect";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { message: "Not authenticated", success: false },
        { status: 401 }
      );
    }

    const { goal_id } = await request.json();

    if (!goal_id) {
      return NextResponse.json(
        { message: "Goal ID is required", success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify goal exists and belongs to user
    const goal = await Goal.findById(goal_id);
    if (!goal) {
      return NextResponse.json(
        { message: "Goal not found", success: false },
        { status: 404 }
      );
    }

    if (goal.user_id !== authUser.userId) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 403 }
      );
    }

    // Start prospect discovery (async)
    const result = await discoverProspectsForGoal(goal);

    return NextResponse.json(
      {
        message: "Prospect discovery completed",
        success: true,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Prospect discovery error:", error);
    return NextResponse.json(
      {
        message: "Failed to discover prospects",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
