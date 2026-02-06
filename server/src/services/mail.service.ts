import nodemailer, { type Transporter } from "nodemailer";

class MailService {
  private readonly GMAIL_USER = process.env.GMAIL_USER as string;
  private readonly GMAIL_APP_PASSWORD = process.env
    .GMAIL_APP_PASSWORD as string;

  private readonly mailTransporter: Transporter;

  constructor() {
    if (!this.GMAIL_USER) {
      throw new Error("GMAIL_USER is not defined");
    }

    if (!this.GMAIL_APP_PASSWORD) {
      throw new Error("GMAIL_APP_PASSWORD is not defined");
    }

    this.mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.GMAIL_USER,
        pass: this.GMAIL_APP_PASSWORD,
      },
    });
  }

  sendVerificationMail = async (email: string, url: string) => {
    try {
      await this.mailTransporter.sendMail({
        from: "The app",
        to: email,
        subject: "Email verification",
        html: `<p>To verify email click link: <a href="${url}">${url}</a></p>`,
      });
    } catch (error) {
      throw new Error("Error sending email");
    }
  };
}

export const mailService = new MailService();
