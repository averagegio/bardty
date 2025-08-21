export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { plan, name, email, cardNumber, exp, cvc } = body || {};
    if (!plan || !name || !email || !cardNumber || !exp || !cvc) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    // This is a mock endpoint. Replace with a PSP integration (e.g., Stripe) in production.
    await new Promise((r) => setTimeout(r, 600));
    return Response.json({ ok: true, plan });
  } catch (e) {
    return Response.json({ error: "Checkout failed" }, { status: 500 });
  }
}


