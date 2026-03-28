import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email: string, otp: string) => {
    // If SMTP credentials aren't set up yet, fallback to console logging the OTP for effortless dev testing
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.log(`\n\n[DEVELOPMENT INTERVIEW MODE] SMTP credentials missing in .env!`);
        console.log(`🚀 Simulated OTP Delivery for [${email}]: ${otp}\n\n`);
        return { success: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: "Your Secure Verification Code | SID Expense Tracker",
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f9f9f9; border-radius: 12px; max-w-lg mx-auto">
                    <h2 style="color: #171717;">Welcome to SID Expense Tracker!</h2>
                    <p style="color: #555;">To explicitly verify your email address and authorize your account for login, please input the following 6-digit Secure Verification Code in your application:</p>
                    <div style="margin: 30px 0;">
                        <h1 style="display: inline-block; background: #ffffff; padding: 15px 30px; border-radius: 8px; font-weight: 900; letter-spacing: 5px; color: #3b82f6; border: 1px solid #e5e5e5;">${otp}</h1>
                    </div>
                    <p style="color: #888; font-size: 12px;">This code securely expires in precisely 10 minutes.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Email dispatch failed:", error);
        return { error: "Failed to send verification email" };
    }
};
