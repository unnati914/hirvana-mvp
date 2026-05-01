import { escapeHtml, sendResendEmail } from "./resend-client";

/**
 * After a successful sign-up, sends optional confirmation via Resend.
 * Never throws — logs errors. Account creation already succeeded.
 *
 * Env:
 * - RESEND_API_KEY — required to send
 * - SIGNUP_EMAIL_FROM — e.g. "Hirvana <accounts@yourdomain.com>" (domain verified in Resend). Else Resend onboarding sender.
 * - NEXTAUTH_URL — included in the email as the sign-in link (optional but recommended)
 */
export async function sendAccountCreatedEmail({ email, name }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return;
  }

  const from =
    process.env.SIGNUP_EMAIL_FROM?.trim() || "Hirvana <onboarding@resend.dev>";

  const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  const safeName = escapeHtml(name || email.split("@")[0] || "there");
  const subject = "Your Hirvana account is ready";
  const html = `
    <p>Hi ${safeName},</p>
    <p>Your account was created successfully. You can sign in anytime with the email and password you used at registration.</p>
    <p><a href="${escapeHtml(baseUrl)}/login">Open Hirvana and sign in</a></p>
    <p>— Hirvana</p>
  `.trim();

  try {
    await sendResendEmail({ apiKey, from, to: email, subject, html });
  } catch (e) {
    console.error("signup confirmation email failed", e?.message || e);
  }
}
