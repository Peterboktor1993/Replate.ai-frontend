import { NextResponse } from "next/server";

export async function POST(request) {
  const { invoicenumber } = await request.json();

  if (!invoicenumber) {
    return NextResponse.json(
      { success: false, message: "Missing invoice number" },
      { status: 400 }
    );
  }

  const appId = process.env.VALOR_APP_ID;
  const appKey = process.env.VALOR_APP_KEY;
  const valorTransactionListUrl = process.env.VALOR_TRANSACTION_LIST_URL;
  const epi = process.env.VALOR_EPI;

  if (!appId || !appKey || !epi || !valorTransactionListUrl) {
    return NextResponse.json(
      { success: false, message: "Server configuration error" },
      { status: 500 }
    );
  }

  const payload = {
    appid: appId,
    appkey: appKey,
    epi: epi,
    txn_type: "txnfetch",
    date_filter: 0,
    source: 0,
    transaction_type: 0,
    card_type: 0,
    transaction_status: "ALL",
    devices: "0",
    processor: "0",
    limit: 200,
    offset: 0,
    offline_mode: 0,
    version: 2,
    epi_filter: false,
  };

  try {
    const valorResponse = await fetch(valorTransactionListUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!valorResponse.ok) {
      const errorText = await valorResponse.text();
      return NextResponse.json(
        { success: false, message: "Valor API Error", details: errorText },
        { status: valorResponse.status }
      );
    }

    const result = await valorResponse.json();
    const transactionList = result.data || [];

    const matchingTxn = transactionList.find(
      (txn) => txn.INVOICE_NO === invoicenumber
    );

    if (!matchingTxn) {
      return NextResponse.json(
        { success: false, message: "Transaction not found for this invoice" },
        { status: 404 }
      );
    }

    const approvedStatuses = ["SALE"];
    const isApproved =
      matchingTxn.RESPONSE_CODE === "00" &&
      approvedStatuses.includes(matchingTxn.TXN_TYPE) &&
      matchingTxn.IS_VOID !== "1";

    if (isApproved) {
      return NextResponse.json({
        success: true,
        message: "Transaction approved",
        transaction: matchingTxn,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Transaction not approved",
        transaction: matchingTxn,
      });
    }
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
