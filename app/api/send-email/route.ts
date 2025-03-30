// api/send-email/route.ts
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
console.log(process.env.SENDGRID_API_KEY);
export async function POST(req: Request) {
  try {
    const { to, subject, text, html } = await req.json();

    const msg = {
      to,
      from: "ajay@coshii.com",
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
