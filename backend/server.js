require('dotenv').config(); // MUST BE FIRST - Load env before other modules
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
try {
    let serviceAccount;
    const localServiceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : process.env.FIREBASE_SERVICE_ACCOUNT;
        console.log("Firebase Admin Initialized securely via Environment Variables.");
    } else if (process.env.NODE_ENV !== 'production' && fs.existsSync(localServiceAccountPath)) {
        serviceAccount = require(localServiceAccountPath);
        console.warn("Firebase Admin Initialized from local serviceAccountKey.json for development.");
    } else {
        throw new Error("CRITICAL: FIREBASE_SERVICE_ACCOUNT environment variable is missing.");
    }
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.error("Firebase Admin Initialization Error. Server shutting down for security.", error);
    process.exit(1);
}

const aiController = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const findUserByEmail = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
        const authUser = await admin.auth().getUserByEmail(normalizedEmail);
        return { exists: true, source: 'auth', authUser };
    } catch (error) {
        if (error.code !== 'auth/user-not-found') {
            throw error;
        }
    }

    const usersSnapshot = await getFirestore()
        .collection('users')
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();

    if (!usersSnapshot.empty) {
        return { exists: true, source: 'firestore', userDoc: usersSnapshot.docs[0] };
    }

    return { exists: false, source: null };
};

// Routes
app.post('/send-otp', async (req, res) => {
    const normalizedEmail = req.body?.email?.trim().toLowerCase();
    const purpose = req.body?.purpose || 'generic';

    if (!normalizedEmail) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const accountStatus = await findUserByEmail(normalizedEmail);

        if (purpose === 'register' && accountStatus.exists) {
            return res.status(409).json({ error: 'Account already exists. Please login.' });
        }

        if (purpose === 'reset-password' && !accountStatus.exists) {
            return res.status(404).json({ error: 'Account does not exist in the database. Please register first.' });
        }

        console.log("Attempting to send email via Brevo API...");

        // Generate secure 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save OTP to Firestore (expires in 10 minutes)
        await getFirestore().collection('otps').doc(normalizedEmail).set({
            code: otp,
            expiresAt: Date.now() + 10 * 60 * 1000 
        });

        // Context: Using Brevo API v3 over HTTPs to avoid SMTP port/auth issues
        const apiKey = process.env.EMAIL_PASS; // We will use the API Key here
        const senderEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;

        const data = JSON.stringify({
            sender: { email: senderEmail, name: 'ExamFobiya' },
            to: [{ email: normalizedEmail }],
            subject: 'Your ExamFobiya Verification Code',
            textContent:
`ExamFobiya Verification Code

Hello,

We received a request to verify your email address for your ExamFobiya account.

Your verification code is: ${otp}

This code will expire in 10 minutes. For your security, please do not share this code with anyone.

If you did not request this code, you can safely ignore this email.

Regards,
ExamFobiya Team`,
            htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ExamFobiya Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937;">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
            <div style="background:linear-gradient(135deg,#0f172a,#1d4ed8);padding:28px 32px;color:#ffffff;">
                <p style="margin:0;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#ffd700;">ExamFobiya</p>
                <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;font-weight:700;">Your verification code</h1>
            </div>
            <div style="padding:32px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hello,</p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                    We received a request to verify your email address for your ExamFobiya account.
                </p>
                <div style="margin:24px 0;padding:20px;border:1px dashed #93c5fd;border-radius:12px;background:#eff6ff;text-align:center;">
                    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb;">Verification Code</p>
                    <p style="margin:0;font-size:36px;line-height:1;font-weight:700;letter-spacing:0.3em;color:#0f172a;">${otp}</p>
                </div>
                <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
                    This code will expire in <strong>10 minutes</strong>. For your security, please do not share it with anyone.
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4b5563;">
                    If you did not request this code, you can safely ignore this email.
                </p>
                <div style="padding-top:20px;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">
                        Regards,<br />
                        <strong style="color:#111827;">ExamFobiya Team</strong>
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
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
                    console.log(`Email sent to ${normalizedEmail}`);
                    res.status(200).json({ message: 'OTP sent successfully' });
                } else {
                    console.error('Brevo API Error:', responseData);
                    res.status(500).json({ error: 'Failed to send OTP via API: ' + responseData });
                }
            });
        });

        apiReq.on('error', (error) => {
            console.error('Network Error:', error);
            res.status(500).json({ error: 'Failed to verify OTP: ' + error.message });
        });

        apiReq.write(data);
        apiReq.end();

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Speed Test Upload Endpoint
// Accepts large payloads and ignores them to measure upload bandwidth
app.post('/api/speedtest/upload', (req, res) => {
    // We don't need to do anything with the data, just acknowledge receipt
    res.status(200).send('Upload received');
});

// Check Admin Role Endpoint
app.post('/api/check-admin', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
        const accountStatus = await findUserByEmail(email);

        if (!accountStatus.exists || accountStatus.source !== 'firestore') {
            return res.status(404).json({ error: 'Account not found.' });
        }

        const userData = accountStatus.userDoc.data();
        if (userData.role !== 'admin') {
            return res.status(403).json({ error: 'You are not an Admin! Please reset your password in the User portal.' });
        }

        res.status(200).json({ message: 'User is admin' });
    } catch (error) {
        console.error('Error checking admin role:', error);
        res.status(500).json({ error: 'Failed to verify account permissions.' });
    }
});

app.post('/api/check-account-exists', async (req, res) => {
    const normalizedEmail = req.body?.email?.trim().toLowerCase();

    if (!normalizedEmail) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const accountStatus = await findUserByEmail(normalizedEmail);

        if (!accountStatus.exists) {
            return res.status(404).json({ exists: false, error: 'Account does not exist in the database. Please register first.' });
        }

        return res.status(200).json({ exists: true });
    } catch (error) {
        console.error('Error checking account existence:', error);
        return res.status(500).json({ error: 'Failed to verify account.' });
    }
});

// OTP Verification Endpoint (For Registration Flow)
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        const otpDocRef = getFirestore().collection('otps').doc(email);
        const otpDoc = await otpDocRef.get();
        if (!otpDoc.exists) {
            return res.status(400).json({ error: 'No OTP found for this email. Please request a new one.' });
        }
        
        const otpData = otpDoc.data();
        if (otpData.code !== otp) {
            return res.status(400).json({ error: 'Invalid OTP code.' });
        }
        
        if (Date.now() > otpData.expiresAt) {
            await otpDocRef.delete();
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // OTP is valid! Delete it so it cannot be reused.
        await otpDocRef.delete();

        res.status(200).json({ message: 'OTP Verified successfully' });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: 'Failed to verify OTP internally.' });
    }
});

// Password Reset Endpoint
app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    try {
        // Validate OTP security
        const otpDocRef = getFirestore().collection('otps').doc(email);
        const otpDoc = await otpDocRef.get();
        if (!otpDoc.exists) {
            return res.status(400).json({ error: 'No OTP found for this email. Please request a new one.' });
        }
        
        const otpData = otpDoc.data();
        if (otpData.code !== otp) {
            return res.status(400).json({ error: 'Invalid OTP code.' });
        }
        
        if (Date.now() > otpData.expiresAt) {
            await otpDocRef.delete();
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // Fetch user using email
        const userRecord = await admin.auth().getUserByEmail(email);
        
        // Update user's password
        await admin.auth().updateUser(userRecord.uid, {
            password: newPassword
        });

        // Delete valid OTP to prevent reuse
        await otpDocRef.delete();

        res.status(200).json({ message: 'Password successfully reset' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Analytics tracking endpoint
app.post('/api/track', async (req, res) => {
    try {
        const db = admin.firestore();
        
        // 1. General Stats
        const statsDocRef = db.collection('stats').doc('general');
        await statsDocRef.set({ visit_count: admin.firestore.FieldValue.increment(1) }, { merge: true });

        // 2. Daily Stats
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDocId = `${year}-${month}-${day}`;

        const dailyDocRef = db.collection('daily_stats').doc(todayDocId);
        await dailyDocRef.set({
            date: todayDocId,
            visits: admin.firestore.FieldValue.increment(1)
        }, { merge: true });
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Tracking Error:', error);
        res.status(500).json({ error: 'Internal server error while tracking' });
    }
});

// AI Suggestions Route
app.post('/api/ai/suggestions', aiController.generateSuggestions);

// AI Question Parsing Route
app.post('/api/ai/parse-questions', aiController.parseQuestions);

app.get('/', (req, res) => {
    res.send('ExamFobiya Backend is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
