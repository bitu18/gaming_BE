const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp-pulse.com', // SendPulse SMTP host
    port: 587, // TLS port (465 if SSL)
    secure: false, // true if port 465
    auth: {
        user: process.env.SENDPULSE_USER, // your SendPulse login (email/login)
        pass: process.env.SENDPULSE_PASSWORD, // your SendPulse SMTP password
    },
});

const sendCodeToEmail = async (email, code) => {
    const mailOptions = {
        from: '"QuestLix" <questlix.gaming@gmail.com>', // must be verified in SendPulse
        to: email,
        subject: 'QuestLix Registration Verification',
        text: `Your 6-digit verification code is: ${code}`,
        html: `
            <h4>Please confirm your account to continue with your registration.</h4>
            <strong>${code}</strong>
            <h3>If you did not make this request, you can safely ignore and delete this email. Then, you can carry on with your nice day.</h3>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendCodeToEmail;
