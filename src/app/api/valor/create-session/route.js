import { NextResponse } from "next/server";

export async function POST(request) {
  const { amount, invoicenumber, customer_name } = await request.json();

  if (!amount || !invoicenumber || !customer_name) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const appId = process.env.VALOR_APP_ID;
  const appKey = process.env.VALOR_APP_KEY;
  const epi = process.env.VALOR_EPI;
  const valorPageSaleUrl = process.env.VALOR_PAGESALE_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!appId || !appKey || !epi || !valorPageSaleUrl || !siteUrl) {
    console.error("Valor environment variables not configured.");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const successUrl = `${siteUrl}/checkout-success`;
  const failureUrl = `${siteUrl}/checkout-failure`;

  const payload = {
    appid: appId,
    appkey: appKey,
    epi: epi,
    txn_type: "sale",
    amount: parseFloat(amount).toFixed(2),
    invoicenumber: invoicenumber,
    surcharge: "0",
    tax: "0",
    epage: "1",
    success_url: successUrl,
    failure_url: failureUrl,
    ignore_surcharge_calc: "0",
    shipping_country: "US",
    customer_name: customer_name,
  };

  try {
    const valorResponse = await fetch(valorPageSaleUrl, {
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
        { error: "Failed to create Valor session", details: errorText },
        { status: valorResponse.status }
      );
    }

    const result = await valorResponse.json();

    if (result.error_no === "S00" && result.url) {
      console.log("Valor session created. URL:", result.url);

      // Extract UID manually from URL
      const urlObj = new URL(result.url);
      const uid = urlObj.searchParams.get("uid");

      console.log(`Extracted UID: ${uid}`);

      if (!uid) {
        return NextResponse.json(
          { error: "Failed to extract UID from Valor URL" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        url: result.url,
        uid,
        amount: parseFloat(amount).toFixed(2),
        invoicenumber,
        customer_name,
      });
    } else {
      console.error("Valor API did not return success or URL:", result);
      return NextResponse.json(
        { error: "Failed to get redirect URL from Valor", details: result },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error calling Valor Pagesale API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
