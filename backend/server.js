require('dotenv').config(); // MUST BE FIRST - Load env before other modules
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const aiController = require('./routes/ai');

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
        console.log("Attempting to send email via Brevo API...");

        // Context: Using Brevo API v3 over HTTPs to avoid SMTP port/auth issues
        const apiKey = process.env.EMAIL_PASS; // We will use the API Key here
        const senderEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;

        const data = JSON.stringify({
            sender: { email: senderEmail },
            to: [{ email: email }],
            subject: 'Your Verification Code - ExamFobiya',
            textContent: `Your verification code is: ${otp}. Please do not share this code with anyone.`
        });

        const options = {
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const https = require('https');
        const apiReq = https.request(options, (apiRes) => {
            let responseData = '';

            apiRes.on('data', (chunk) => {
                responseData += chunk;
            });

            apiRes.on('end', () => {
                if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
                    console.log(`Email sent to ${email}`);
                    res.status(200).json({ message: 'OTP sent successfully' });
                } else {
                    console.error('Brevo API Error:', responseData);
                    res.status(500).json({ error: 'Failed to send OTP via API' });
                }
            });
        });

        apiReq.on('error', (error) => {
            console.error('Network Error:', error);
            res.status(500).json({ error: 'Failed to verify OTP' });
        });

        apiReq.write(data);
        apiReq.end();

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// AI Suggestions Route
app.post('/api/ai/suggestions', aiController.generateSuggestions);

app.get('/', (req, res) => {
    res.send('ExamFobiya Backend is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
