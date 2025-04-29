import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Implement your preferred method of handling the contact form data
    // Options:
    // 1. Send email using a service like SendGrid or NodeMailer
    // 2. Store in a database
    // 3. Forward to a CRM system
    // 4. Send to an external API

    // For now, we'll just log the data and return success
    console.log("Contact Form Submission:", { name, email, message });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Message received successfully",
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
