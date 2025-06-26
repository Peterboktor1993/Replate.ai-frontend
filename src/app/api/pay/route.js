import { BASE_URL } from "@/utils/CONSTANTS";
import { NextResponse } from "next/server";

export async function GET(request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order_id");
  const customerId = url.searchParams.get("customer_id");
  const callbackUrl =
    url.searchParams.get("callback") || `${url.origin}/checkout-status`;

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "Order ID is required" },
      { status: 400 }
    );
  }

  try {
    const stripePaymentUrl = `${BASE_URL}/payment-mobile?order_id=${orderId}&customer_id=${
      customerId || ""
    }&payment_method=stripe&payment_platform=stripe&callback=${encodeURIComponent(
      callbackUrl
    )}`;

    return NextResponse.json({
      success: true,
      paymentUrl: stripePaymentUrl,
      message: "Order placed successfully",
      order_id: Number(orderId),
    });
  } catch (error) {
    console.error("Error generating payment URL:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate payment URL",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order_id,
      status: "paid",
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Payment processing failed",
      },
      { status: 500 }
    );
  }
}
