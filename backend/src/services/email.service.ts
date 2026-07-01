import nodemailer from 'nodemailer';

export const sendResetEmail = async (to: string, token: string): Promise<void> => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587');
  const user = process.env.EMAIL_USER || 'placeholder@gmail.com';
  const pass = process.env.EMAIL_PASS || 'placeholder_pass';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Using a stub/mock setup if credentials are defaults
  console.log(`Email Service: Preparing to send reset email to ${to}`);
  console.log(`Email Service: Reset Link is ${frontendUrl}/reset-password?token=${token}`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `"Campus Lost & Found" <${user}>`,
    to,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Please click on the link to reset your password: ${frontendUrl}/reset-password?token=${token}\nThis token is valid for 1 hour.`,
    html: `<p>You requested a password reset.</p><p>Please click <a href="${frontendUrl}/reset-password?token=${token}">here</a> to reset your password.</p><p>This link is valid for 1 hour.</p>`,
  };

  // Do not crash the app if mailing configuration isn't verified or fails.
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email Service: Password reset email successfully sent to ${to}`);
  } catch (error) {
    console.error('Email Service Error sending mail:', error);
  }
};
