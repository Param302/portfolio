import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function buildTransporter() {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

    if (!user || !pass) {
        throw new Error("SMTP credentials are not configured.");
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export async function POST(request) {
    try {
        const { name, email, subject, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Name, email, and message are required." },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        const transporter = buildTransporter();
        const fromAddress = process.env.SMTP_USER || "hey@itsparam.in";
        const toAddress = process.env.CONTACT_TO || "hey@itsparam.in";
        const mailSubject =
            subject && subject.trim().length > 0
                ? subject.trim()
                : `New Portfolio Message from ${name}`;
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(mailSubject);
        const safeMessage = escapeHtml(message);

        await transporter.sendMail({
            from: `"${name} - from Portfolio website" <${fromAddress}>`,
            to: toAddress,
            replyTo: `${name} <${email}>`,
            subject: mailSubject,
            text: [
                `Name: ${name}`,
                `Email: ${email}`,
                "",
                "Message:",
                message,
            ].join("\n"),
            html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1a2235;">
          <h2 style="margin:0 0 12px;">New Portfolio Contact Message</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;">${safeMessage}</p>
        </div>
      `,
        });

        return NextResponse.json({ ok: true, message: "Message sent." });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error?.message ||
                    "Unable to send message right now. Please try again later.",
            },
            { status: 500 }
        );
    }
}
