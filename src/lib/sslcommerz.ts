const SANDBOX_BASE = "https://sandbox.sslcommerz.com";
const LIVE_BASE = "https://securepay.sslcommerz.com";

function isSandbox() {
  return process.env.SSLCOMMERZ_SANDBOX !== "false";
}

function baseUrl() {
  return isSandbox() ? SANDBOX_BASE : LIVE_BASE;
}

export type CreateSessionInput = {
  tranId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  productName?: string;
};

export type CreateSessionResult =
  | { ok: true; gatewayPageUrl: string }
  | { ok: false; error: string };

/**
 * Opens a transaction session with SSLCommerz and returns the gateway
 * page URL to redirect the customer to. See "STEP 1" in SSLCommerz's
 * integration guide.
 */
export async function createSslcommerzSession(
  input: CreateSessionInput
): Promise<CreateSessionResult> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!storeId || !storePassword || !appUrl) {
    return { ok: false, error: "Payment gateway is not configured." };
  }

  const body = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: input.amount.toFixed(2),
    currency: "BDT",
    tran_id: input.tranId,
    success_url: `${appUrl}/api/payments/sslcommerz/success`,
    fail_url: `${appUrl}/api/payments/sslcommerz/fail`,
    cancel_url: `${appUrl}/api/payments/sslcommerz/cancel`,
    ipn_url: `${appUrl}/api/payments/sslcommerz/ipn`,
    shipping_method: "NO",
    product_name: input.productName ?? "Wallet top-up",
    product_category: "Digital Service",
    product_profile: "general",
    num_of_item: "1",
    cus_name: input.customerName || input.customerEmail,
    cus_email: input.customerEmail,
    cus_add1: "N/A",
    cus_city: "N/A",
    cus_postcode: "N/A",
    cus_country: "Bangladesh",
    cus_phone: "N/A",
  });

  try {
    const res = await fetch(`${baseUrl()}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });

    const data = await res.json();
    if (data.status === "SUCCESS" && data.GatewayPageURL) {
      return { ok: true, gatewayPageUrl: data.GatewayPageURL };
    }
    return { ok: false, error: data.failedreason ?? "Could not start the payment session." };
  } catch {
    return { ok: false, error: "Could not reach the payment gateway." };
  }
}

export type ValidateTransactionResult =
  | {
      ok: true;
      status: "VALID" | "VALIDATED" | "FAILED" | "CANCELLED";
      amount: number;
      tranId: string;
      cardType?: string;
      riskLevel?: string;
    }
  | { ok: false; error: string };

/**
 * Calls SSLCommerz's Validation API to confirm an IPN notification is
 * genuine before trusting it. See "STEP 2" in SSLCommerz's integration
 * guide, never credit a wallet from the IPN payload alone.
 */
export async function validateSslcommerzTransaction(
  valId: string
): Promise<ValidateTransactionResult> {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;

  if (!storeId || !storePassword) {
    return { ok: false, error: "Payment gateway is not configured." };
  }

  const params = new URLSearchParams({
    val_id: valId,
    store_id: storeId,
    store_passwd: storePassword,
    v: "1",
    format: "json",
  });

  try {
    const res = await fetch(
      `${baseUrl()}/validator/api/validationserverAPI.php?${params.toString()}`,
      { cache: "no-store" }
    );
    const data = await res.json();

    if (data.status !== "VALID" && data.status !== "VALIDATED") {
      return { ok: false, error: `Transaction status: ${data.status ?? "unknown"}.` };
    }

    return {
      ok: true,
      status: data.status,
      amount: Number(data.amount),
      tranId: data.tran_id,
      cardType: data.card_type,
      riskLevel: data.risk_level,
    };
  } catch {
    return { ok: false, error: "Could not reach the payment gateway to validate." };
  }
}
