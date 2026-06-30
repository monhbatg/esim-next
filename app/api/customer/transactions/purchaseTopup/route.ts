import { NextRequest, NextResponse } from "next/server";

type QPayAppLink = {
  name?: string;
  description?: string;
  logo?: string;
  link: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const {
      phoneNumber,
      email,
      amount,
      packageCode,
      description = "eSIM Purchase",
    } = body as {
      phoneNumber?: string;
      email?: string;
      amount?: number;
      packageCode?: string;
      description?: string;
    };

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (!packageCode || typeof packageCode !== "string") {
      return NextResponse.json(
        { success: false, error: "Package code is required" },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const backendUrl = `${apiUrl}/api/customer/transactions/purchase`;

    const backendRequestBody = {
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      amount,
      packageCode: packageCode.trim(),
      description: description?.trim() || "eSIM Purchase",
    };

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(backendRequestBody),
    });

    const backendData = await backendResponse.json().catch(() => ({}));

    if (!backendResponse.ok) {
      const errorMessage =
        backendData?.message ||
        backendData?.error ||
        `HTTP error! status: ${backendResponse.status}`;

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: backendResponse.status }
      );
    }

    const purchaseData = backendData?.data ?? backendData ?? {};
    const rawUrls = Array.isArray(purchaseData?.urls) ? purchaseData.urls : [];
    const normalizedUrls: QPayAppLink[] = rawUrls
      .filter((item: unknown): item is QPayAppLink => {
        if (
          !item ||
          typeof item !== "object" ||
          !("link" in item) ||
          typeof (item as { link: unknown }).link !== "string"
        ) {
          return false;
        }
        const link = (item as { link: string }).link;
        return link.trim().length > 0;
      })
      .map((item: QPayAppLink) => ({
        name: item.name,
        description: item.description,
        logo: item.logo,
        link: item.link,
      }));

    return NextResponse.json({
      success: true,
      data: {
        invoice_id:
          purchaseData.invoice_id ||
          purchaseData.invoiceId ||
          purchaseData.invoiceID,
        qr_image: purchaseData.qr_image || purchaseData.qrImage,
        qr_link:
          purchaseData.qr_link ||
          purchaseData.qrLink ||
          purchaseData.qPay_shortUrl,
        qr_text: purchaseData.qr_text || purchaseData.qrText,
        qPay_shortUrl: purchaseData.qPay_shortUrl,
        customerId: purchaseData.customerId,
        internalInvoiceId:
          purchaseData.internalInvoiceId || purchaseData.internal_invoice_id,
        urls: normalizedUrls.length ? normalizedUrls : undefined,
      },
    });
  } catch (error) {
    console.error("Customer purchase API error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while processing purchase";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
