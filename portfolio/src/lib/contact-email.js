import nodemailer from "nodemailer";

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export async function sendContactEmail({ name, email, subject, message }) {
  const port = Number(process.env.SMTP_PORT || 465);
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) throw new Error("Email notification is not configured.");
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST || "smtp.gmail.com", port, secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  await transporter.sendMail({
    from: `"Portfolio contact" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_TO || "hey@itsparam.in",
    replyTo: `${name} <${email}>`,
    subject: `Portfolio: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a2235"><h2>New portfolio message</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p></div>`,
  });
}
