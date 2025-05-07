import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const uid = url.searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment UID is required",
        },
        { status: 400 }
      );
    }

    const appId = process.env.VALOR_APP_ID;
    const appKey = process.env.VALOR_APP_KEY;
    const epi = process.env.VALOR_EPI;
    const valorTransactionDetailUrl = process.env.VALOR_TRANSACTION_DETAIL_URL;

    if (!appId || !appKey || !epi || !valorTransactionDetailUrl) {
      console.error("Valor environment variables not configured.");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const payload = {
      appid: appId,
      appkey: appKey,
      epi: epi,
      txn_type: "txndetail",
      txnuid: uid,
    };

    const valorResponse = await fetch(valorTransactionDetailUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!valorResponse.ok) {
      const errorText = await valorResponse.text();
      console.error(`Valor API Error (${valorResponse.status}): ${errorText}`);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to check payment status",
          details: errorText,
        },
        { status: valorResponse.status }
      );
    }

    const result = await valorResponse.json();

    if (result && result.data) {
      // Check the payment status from the Valor response
      const txnData = result.data;

      const approvedStatuses = ["SALE", "AUTH"];
      const failedStatuses = ["FAILED", "DECLINED", "TIMEOUT", "CANCELLED"];

      if (
        txnData.RESPONSE_CODE === "00" &&
        approvedStatuses.includes(txnData.TXN_TYPE) &&
        txnData.IS_VOID !== "1"
      ) {
        return NextResponse.json({
          success: true,
          message: "Payment successful",
          data: txnData,
        });
      } else if (
        failedStatuses.includes(txnData.TXN_STATUS) ||
        txnData.RESPONSE_CODE !== "00"
      ) {
        return NextResponse.json({
          failed: true,
          message: "Payment failed or was cancelled",
          data: txnData,
        });
      } else {
        // Payment is still processing
        return NextResponse.json({
          processing: true,
          message: "Payment is still processing",
          data: txnData,
        });
      }
    } else if (result && result.error_no !== "S00") {
      // Transaction not found or other error
      return NextResponse.json({
        processing: true,
        message: "Payment is still processing or not found",
        details: result,
      });
    } else {
      console.error("Unexpected response format from Valor API:", result);
      return NextResponse.json(
        {
          error: "Unexpected response from payment processor",
          details: result,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while checking payment status",
      },
      { status: 500 }
    );
  }
}
