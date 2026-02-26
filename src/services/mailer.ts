import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const mailer = {
  async sendMail({ to, subject, html }: {
    to: string;
    subject: string;
    html: string;
  }) {
    return await resend.emails.send({
      from: "App Consultor <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
  },
};