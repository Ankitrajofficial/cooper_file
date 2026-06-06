type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
  type: "welcome" | "link_created";
};

function isEmailWebhookConfigured() {
  return Boolean(process.env.GOOGLE_APPS_SCRIPT_EMAIL_WEBHOOK_URL);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendEmail(payload: EmailPayload) {
  const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_EMAIL_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      skipped: true,
    };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: process.env.GOOGLE_APPS_SCRIPT_EMAIL_WEBHOOK_SECRET || "",
      fromName: process.env.EMAIL_FROM_NAME || "Cooperfile",
      ...payload,
    }),
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    error?: string;
  } | null;

  if (!response.ok || !result?.success) {
    throw new Error("Email webhook failed.");
  }

  return {
    skipped: false,
  };
}

export async function sendWelcomeEmail(email: string) {
  if (!isEmailWebhookConfigured()) {
    return { skipped: true };
  }

  return sendEmail({
    to: email,
    type: "welcome",
    subject: "Welcome to Cooperfile",
    text:
      "Congratulations! Your Cooperfile account is ready. You can now create up to 2 free review links per month, with 100 review scripts per link.",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>Congratulations!</h2>
        <p>Your Cooperfile account is ready.</p>
        <p>You can now create up to <strong>2 free review links per month</strong>, with <strong>100 review scripts per link</strong>.</p>
        <p>Log in to create your first QR review link.</p>
      </div>
    `,
  });
}

export async function sendLinkCreatedEmail(options: {
  email: string;
  businessName: string;
  publicReviewUrl: string;
}) {
  if (!isEmailWebhookConfigured()) {
    return { skipped: true };
  }

  const businessName = escapeHtml(options.businessName);
  const publicReviewUrl = escapeHtml(options.publicReviewUrl);

  return sendEmail({
    to: options.email,
    type: "link_created",
    subject: `Your review link is ready for ${options.businessName}`,
    text: `Congratulations! Your review link for ${options.businessName} is ready: ${options.publicReviewUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>Your review link is ready</h2>
        <p>Congratulations! Your review link for <strong>${businessName}</strong> is ready.</p>
        <p><a href="${publicReviewUrl}">${publicReviewUrl}</a></p>
        <p>Download the QR code from your dashboard and place it on your final product, invoice, or counter display.</p>
      </div>
    `,
  });
}
