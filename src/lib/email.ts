/**
 * Email abstraction.
 *
 * Currently a placeholder. To enable Resend:
 *   pnpm add resend
 *   uncomment the implementation below
 *   fill RESEND_API_KEY and EMAIL_FROM in .env.local
 *
 * Rule: the resend import MUST stay in this file. Components only call
 * the named functions below.
 */

// import { Resend } from "resend";
// import { env } from "@/lib/env";
// const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail(_params: SendEmailParams): Promise<void> {
  throw new Error("Email not configured. See src/lib/email.ts.");
  // const { data, error } = await resend.emails.send({
  //   from: env.EMAIL_FROM!,
  //   to: _params.to,
  //   subject: _params.subject,
  //   html: _params.html ?? "",
  //   text: _params.text,
  // });
  // if (error) {
  //   console.error("Resend error:", error);
  //   throw new Error(`Failed to send email: ${error.message}`);
  // }
  // return data;
}
