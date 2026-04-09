require('dotenv').config(); // MUST BE FIRST - Load env before other modules
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
try {
    let serviceAccount;
    // Strictly require production environment variable.
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error("CRITICAL: FIREBASE_SERVICE_ACCOUNT environment variable is missing.");
    }
    
    serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string' 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
        : process.env.FIREBASE_SERVICE_ACCOUNT;
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized securely via Environment Variables.");
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

// Routes
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        console.log("Attempting to send email via Brevo API...");

        // Generate secure 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save OTP to Firestore (expires in 10 minutes)
        await getFirestore().collection('otps').doc(email).set({
            code: otp,
            expiresAt: Date.now() + 10 * 60 * 1000 
        });

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
        const usersRef = getFirestore().collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Account not found.' });
        }

        const userData = snapshot.docs[0].data();
        if (userData.role !== 'admin') {
            return res.status(403).json({ error: 'You are not an Admin! Please reset your password in the User portal.' });
        }

        res.status(200).json({ message: 'User is admin' });
    } catch (error) {
        console.error('Error checking admin role:', error);
        res.status(500).json({ error: 'Failed to verify account permissions.' });
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
