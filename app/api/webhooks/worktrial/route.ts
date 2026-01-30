import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Prospect from "@/models/Prospect";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const email = body.candidate_email;
    const score = Number(body.score);
    const maxScore = Number(body.max_score || 100);

    if (!email || isNaN(score)) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    console.log("🧪 WorkTrial result received for:", email);

    const prospect = await Prospect.findOne({ email });

    if (!prospect) {
      console.log("⚠️ Prospect not found for email:", email);
      return NextResponse.json({ success: true });
    }

    // Normalize assignment score to 0–10 scale
    const normalizedAssignmentScore = (score / maxScore) * 10;

    // 🎯 Final Score Formula
    const finalScore =
      prospect.ai_score * 0.6 + normalizedAssignmentScore * 0.4;

    prospect.assignment_status = "completed";
    prospect.assignment_score = normalizedAssignmentScore;
    prospect.final_score = Number(finalScore.toFixed(2));
    prospect.updated_at = new Date();

    await prospect.save();

    console.log(
      `🏆 Final score for ${prospect.name}:`,
      prospect.final_score
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ WorkTrial webhook error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
