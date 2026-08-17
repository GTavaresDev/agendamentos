import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

const APP_URL = process.env.APP_URL || "https://agendamentos.vercel.app";

function passwordResetEmailHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="440" cellpadding="0" cellspacing="0" style="max-width:440px;width:100%;">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:32px;height:32px;"><img src="${APP_URL}/agendamentos_icon.png" width="32" height="32" alt="Agendamentos" style="display:block;border-radius:10px;width:32px;height:32px;" /></td>
                    <td style="padding-left:10px;">
                      <div style="font-size:18px;font-weight:700;color:#09090b;line-height:1;letter-spacing:-0.02em;">Agendamentos</div>
                      <div style="margin-top:3px;font-size:9.5px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.14em;line-height:1;">Gestão &amp; Agenda</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color:#ffffff;border:1px solid #e4e4e7;border-radius:16px;padding:32px;">
                <h1 style="margin:0;font-size:20px;font-weight:600;color:#09090b;letter-spacing:-0.02em;text-align:center;">Redefinir sua senha</h1>
                <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#71717a;text-align:center;">
                  Recebemos um pedido para redefinir a senha da sua conta no portal.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
                  <tr>
                    <td style="border-radius:12px;background-color:#000000;">
                      <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">
                        Criar nova senha
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#a1a1aa;text-align:center;">
                  O link expira em 5 minutos. Se você não pediu isso, ignore este e-mail.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;text-align:center;font-size:12px;color:#a1a1aa;">
                &copy; 2026 Agendamentos. Todos os direitos reservados.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  await getTransporter().sendMail({
    from: `Agendamentos <${process.env.GMAIL_USER}>`,
    to: input.to,
    subject: "Redefinir sua senha",
    html: passwordResetEmailHtml(input.resetUrl),
  });
}
