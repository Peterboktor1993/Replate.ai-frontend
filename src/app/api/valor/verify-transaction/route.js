import { NextResponse } from "next/server";

export async function POST(request) {
  const { uid } = await request.json();

  if (!uid) {
    return NextResponse.json(
      { success: false, message: "Missing transaction UID" },
      { status: 400 }
    );
  }

  const appId = process.env.VALOR_APP_ID;
  const appKey = process.env.VALOR_APP_KEY;
  const valorTransactionListUrl = process.env.VALOR_TRANSACTION_LIST_URL;

  if (!appId || !appKey || !valorTransactionListUrl) {
    console.error(
      "Valor environment variables not configured for verification."
    );
    return NextResponse.json(
      { success: false, message: "Server configuration error" },
      { status: 500 }
    );
  }

  const payload = {
    appid: appId,
    appkey: appKey,
    uid: uid,
  };

  try {
    const valorResponse = await fetch(valorTransactionListUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!valorResponse.ok) {
      const errorText = await valorResponse.text();
      console.error(
        `Valor Verification API Error (${valorResponse.status}): ${errorText}`
      );
      // Consider NOT deleting temporary order here, maybe retry later?
      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify transaction with Valor",
          details: errorText,
        },
        { status: valorResponse.status }
      );
    }

    const result = await valorResponse.json();

    // Check Valor's response structure for success/failure
    if (
      result.error_no === "S00" &&
      (result.status === "approved" || result.status === "captured")
    ) {
      console.log(
        `Valor transaction verified: UID=${uid}, Status=${result.status}`
      );

      // --- IMPORTANT: Finalize Order --- //
      // 1. Retrieve the temporarily stored order details using UID
      // const orderDetails = await getTemporaryOrder(uid);
      // if (!orderDetails) {
      //   console.error(`Could not find temporary order for UID: ${uid}`);
      //   return NextResponse.json({ success: false, message: 'Order details not found for verification' }, { status: 500 });
      // }

      // 2. Place the actual order in your system
      // try {
      //   const finalOrder = await finalizeOrder(orderDetails); // Your actual order placement function
      //   console.log(`Order ${finalOrder.id} created successfully after verification.`);
      // } catch (orderError) {
      //    console.error(`Failed to place final order for UID: ${uid}`, orderError);
      // Decide how to handle this critical error - maybe retry, notify admin?
      //    return NextResponse.json({ success: false, message: 'Payment verified but order creation failed.' }, { status: 500 });
      // }

      // 3. Clean up temporary storage
      // await deleteTemporaryOrder(uid);
      // ----------------------------------- //

      return NextResponse.json({ success: true, status: result.status });
    } else {
      console.warn(
        `Valor transaction verification failed or declined: UID=${uid}`,
        result
      );
      // Clean up temporary storage for failed/declined transactions
      // await deleteTemporaryOrder(uid);
      return NextResponse.json(
        {
          success: false,
          status: result.status || "failed",
          message: result.message || "Payment was not approved",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error calling Valor Transaction List API:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error during verification" },
      { status: 500 }
    );
  }
}
