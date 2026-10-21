import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

export async function sendLicenseEmail(to: string, key: string): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.warn('SMTP not configured — skipping license email to', to);
    return;
  }
  const from = process.env.EMAIL_FROM ?? 'HDUX Pro <noreply@hdux.dev>';
  await t.sendMail({
    from,
    to,
    subject: 'Your HDUX Pro License Key',
    text: [
      'Thank you for purchasing HDUX Pro!',
      '',
      `Your license key: ${key}`,
      '',
      'Add it to your app:',
      '',
      '  import { HduxProProvider } from "@hamiltondynamic/hdux/pro";',
      '',
      `  <HduxProProvider licenseKey="${key}">`,
      '    {/* your app */}',
      '  </HduxProProvider>',
      '',
      'Documentation: https://hdux.dev',
    ].join('\n'),
    html: `<!DOCTYPE html>
<html lang="en">
<body style="background:#0a0a1a;color:#e0e0e0;font-family:monospace;max-width:600px;margin:0 auto;padding:40px 24px">
  <h1 style="color:#00d4ff;letter-spacing:.1em;margin-bottom:8px">HDUX PRO</h1>
  <p>Thank you for your purchase! Your license key:</p>
  <div style="background:#111;border:1px solid #00d4ff;color:#00d4ff;padding:16px 24px;font-size:1.05rem;margin:20px 0;word-break:break-all">${key}</div>
  <p>Add it to your app:</p>
  <pre style="background:#111;padding:16px;overflow:auto;color:#e0e0e0">import { HduxProProvider } from "@hamiltondynamic/hdux/pro";

&lt;HduxProProvider licenseKey="${key}"&gt;
  {/* your app */}
&lt;/HduxProProvider&gt;</pre>
  <p style="margin-top:32px"><a href="https://hdux.dev" style="color:#00d4ff">hdux.dev</a></p>
</body>
</html>`,
  });
  console.log('License email sent to', to);
}
