const nodemailer = require("nodemailer");

const sendVerificationEmail = async (to, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your Gmail app password
    },
  });

  const verificationUrl = `${process.env.BASE_URL}/api/verify-email?token=${token}`;

  const mailOptions = {
    from: `"SkillQuest" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your SkillQuest account",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to SkillQuest, adventurer 🧙‍♂️</h2>
        <p>Before you begin leveling up your skills, you need to verify your email address.</p>
        <a 
          href="${verificationUrl}" 
          style="background-color: #4f46e5; color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px;"
        >
          Verify My Email
        </a>
        <p>If the button doesn't work, copy and paste the link below into your browser:</p>
        <p>${verificationUrl}</p>
        <br/>
        <small>If you did not sign up for SkillQuest, you can ignore this email.</small>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent to", to);
  } catch (err) {
    console.error("❌ Failed to send verification email:", err);
    throw err;
  }
};

module.exports = sendVerificationEmail;
