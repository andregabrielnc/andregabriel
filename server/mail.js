import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || 'André Gabriel <noreply@andregabriel.com.br>';

export async function sendVerificationEmail(to, name, token) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${baseUrl}/auth/verify/${token}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Confirme seu cadastro — André Gabriel',
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8f9fa;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:#1a73e8;color:#fff;font-weight:700;font-size:20px;line-height:48px">AG</div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e8eaed">
          <h1 style="font-size:20px;color:#202124;margin:0 0 8px;text-align:center">Confirme seu e-mail</h1>
          <p style="font-size:14px;color:#5f6368;margin:0 0 24px;text-align:center">
            Olá <strong>${name.split(' ')[0]}</strong>, clique no botão abaixo para ativar sua conta.
            Este link expira em <strong>24 horas</strong>.
          </p>
          <div style="text-align:center">
            <a href="${link}" style="display:inline-block;background:#1a73e8;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px">
              Confirmar meu cadastro
            </a>
          </div>
          <p style="font-size:12px;color:#9aa0a6;margin:24px 0 0;text-align:center">
            Se você não se cadastrou, ignore este e-mail.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to, name) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Bem-vindo(a) à plataforma — André Gabriel',
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8f9fa;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:#1a73e8;color:#fff;font-weight:700;font-size:20px;line-height:48px">AG</div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e8eaed">
          <h1 style="font-size:20px;color:#202124;margin:0 0 8px;text-align:center">Bem-vindo(a), ${name.split(' ')[0]}!</h1>
          <p style="font-size:14px;color:#5f6368;margin:0 0 24px;text-align:center">
            Sua conta foi ativada com sucesso. Agora você tem acesso completo à área do aluno com todos os recursos de estudo.
          </p>
          <div style="text-align:center">
            <a href="${baseUrl}/?login=1" style="display:inline-block;background:#1a73e8;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px">
              Acessar minha conta
            </a>
          </div>
          <p style="font-size:12px;color:#9aa0a6;margin:24px 0 0;text-align:center">
            Bons estudos!
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendResetEmail(to, name, token) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${baseUrl}/?reset=${token}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Redefinir senha — André Gabriel',
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8f9fa;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:#1a73e8;color:#fff;font-weight:700;font-size:20px;line-height:48px">AG</div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e8eaed">
          <h1 style="font-size:20px;color:#202124;margin:0 0 8px;text-align:center">Redefinir senha</h1>
          <p style="font-size:14px;color:#5f6368;margin:0 0 24px;text-align:center">
            Olá <strong>${name.split(' ')[0]}</strong>, clique no botão abaixo para criar uma nova senha.
            Este link expira em <strong>30 minutos</strong>.
          </p>
          <div style="text-align:center">
            <a href="${link}" style="display:inline-block;background:#1a73e8;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px">
              Redefinir minha senha
            </a>
          </div>
          <p style="font-size:12px;color:#9aa0a6;margin:24px 0 0;text-align:center">
            Se você não solicitou, ignore este e-mail.
          </p>
        </div>
      </div>
    `,
  });
}
