const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/ai/suggestions
 * Generate personalized internet speed improvement suggestions using AI
 */
const generateSuggestions = async (req, res) => {
    try {
        const { download, upload, ping, ratings, browserType, timeOfDay } = req.body;

        // Validate required fields
        if (download === undefined || upload === undefined || ping === undefined || !ratings) {
            return res.status(400).json({
                error: 'Missing required fields: download, upload, ping, ratings'
            });
        }

        console.log('DEBUG - API Key loaded:', process.env.GEMINI_API_KEY ? 'YES' : 'NO');
        console.log('DEBUG - API Key length:', process.env.GEMINI_API_KEY?.length);

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an internet connectivity expert. Based on the following speed test results, provide exactly 4 specific, actionable suggestions to improve internet speed.

Speed Test Results:
- Download: ${download} Mbps
- Upload: ${upload} Mbps
- Ping: ${ping} ms
- Gaming Rating: ${ratings.gaming}/5
- Streaming Rating: ${ratings.streaming}/5
- Browsing Rating: ${ratings.browsing}/5
- Video Calling Rating: ${ratings.calling}/5
- Time of Day: ${timeOfDay || 'unknown'}
- Browser: ${browserType || 'unknown'}

Provide suggestions in a simple numbered list format (1., 2., 3., 4.).
CRITICAL INSTRUCTIONS:
- Do NOT use bold titles or headings.
- Write ONLY a single, clear sentence for each suggestion.
- Focus on practical, universal solutions.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the AI response into an array of suggestions
        const suggestions = text
            .split(/\d+\.\s+/)
            .filter(s => s.trim().length > 0)
            .map(s => s.trim());

        res.status(200).json({
            suggestions,
            source: 'ai'
        });

    } catch (error) {
        console.error('AI suggestion generation error:', error);

        // Return error for frontend to fallback to generic suggestions
        res.status(500).json({
            error: 'AI generation failed',
            message: error.message
        });
    }
};

module.exports = {
    generateSuggestions
};
