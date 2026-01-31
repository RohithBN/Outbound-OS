import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Prospect } from "@/models";
import { classifyReply } from "@/lib/aiReplyClassifier";
import { sendAssignmentEmail } from "@/lib/outreach/sendAssignmentEmail";
import { Email } from "@/models";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const senderEmail = body.data?.from?.email;
    const replyText = body.data?.text || body.data?.html || "";

    if (!senderEmail) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    console.log("📩 Reply received from:", senderEmail);

    const prospect = await Prospect.findOne({ email: senderEmail });

    if (!prospect) {
      console.log("⚠️ No prospect found for this email");
      return NextResponse.json({ success: true });
    }

    // Save inbound email
    await Email.create({
        goal_id: prospect.goal_id,
        prospect_id: prospect._id,
        to: senderEmail,
        subject: body.data?.subject || "Reply",
        body: replyText,
        direction: "inbound",
        status: "received",
      });

    // 🧠 Classify reply intent
    const category = await classifyReply(replyText);

    prospect.outreach_status = "replied";
    prospect.reply_category = category;
    await prospect.save();

    console.log(`🧠 Reply categorized as: ${category}`);

    // 🚀 Send assignment if interested
    if (category === "interested") {
      await sendAssignmentEmail(prospect);
      prospect.assignment_status = "sent";
      await prospect.save();
      console.log("📨 Assignment email sent");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Resend webhook error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
