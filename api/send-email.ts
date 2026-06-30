import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, message, from_name, from_email } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Formulário Briefing CTT" <${process.env.GMAIL_USER}>`,
      to: 'volodymyr.grikh@ctt.pt',
      replyTo: from_email || process.env.GMAIL_USER,
      subject,
      text: `De: ${from_name} <${from_email}>\n\n${message}`,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
