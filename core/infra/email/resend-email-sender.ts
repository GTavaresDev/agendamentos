import { Resend } from "resend";

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.PASSWORD_RESET_FROM_EMAIL!,
    to: input.to,
    subject: "Redefinir sua senha",
    html: `<p>Recebemos um pedido para redefinir sua senha.</p>
<p><a href="${input.resetUrl}">Clique aqui para criar uma nova senha</a></p>
<p>O link expira em 5 minutos. Se você não pediu isso, ignore este e-mail.</p>`,
  });
}
