const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/send-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            logger: true,
            debug: true,
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,   // 10 seconds
            socketTimeout: 10000,     // 10 seconds
            tls: {
                rejectUnauthorized: false
            },
            family: 4, // Force IPv4
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification Code - ExamFobiya',
            text: `Your verification code is: ${otp}. Please do not share this code with anyone.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
        res.status(200).json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

app.get('/', (req, res) => {
    res.send('ExamFobiya Backend is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
