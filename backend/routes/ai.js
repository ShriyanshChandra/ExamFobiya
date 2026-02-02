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

/**
 * POST /api/ai/parse-questions
 * Parse question content into individual Q&A pairs using AI
 */
const parseQuestions = async (req, res) => {
    try {
        const { content } = req.body;

        // Validate required field
        if (!content || content.trim() === '' || content === '<p><br></p>') {
            return res.status(400).json({
                error: 'Content is required and cannot be empty'
            });
        }

        console.log('DEBUG - Parsing questions with AI...');
        console.log('DEBUG - Content length:', content.length);

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `You are a question parser. Extract individual question-answer pairs from the provided content and return them with their HTML formatting preserved.

CRITICAL RULES:
1. DO NOT alter, rephrase, or modify ANY text - preserve it EXACTLY as written.
2. PRESERVE all HTML formatting tags. DO NOT convert lists to paragraphs.
3. SPECIFICALLY KEEP: <ul>, <ol>, <li>, <strong>, <em>, <br>, <p>.
4. If content contains multiple Q&A pairs, split them into separate entries.
5. Return ONLY valid JSON array format.

EXAMPLE:
Input:
Q: List the colors?
A: <ul><li>Red</li><li>Blue</li></ul>

Output:
[
  {
    "question": "List the colors?",
    "answer": "<ul><li>Red</li><li>Blue</li></ul>"
  }
]

Content to parse:
${content}

Return format (JSON array only, nothing else):
[
  {
    "question": "HTML-formatted question with all tags preserved",
    "answer": "HTML-formatted answer with all tags preserved including <ul>, <li>, <strong>, etc."
  }
]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        console.log('DEBUG - AI Response length:', text.length);
        console.log('DEBUG - AI Response preview:', text.substring(0, 200));

        // Clean up the response - remove markdown code blocks if present
        text = text.trim();
        if (text.startsWith('```json')) {
            text = text.substring(7); // Remove ```json
        }
        if (text.startsWith('```')) {
            text = text.substring(3); // Remove ```
        }
        if (text.endsWith('```')) {
            text = text.substring(0, text.length - 3); // Remove trailing ```
        }
        text = text.trim();

        // Parse the JSON response
        let parsedQuestions;
        try {
            parsedQuestions = JSON.parse(text);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Text that failed to parse:', text);
            throw new Error('AI returned invalid JSON format');
        }

        // Validate the structure
        if (!Array.isArray(parsedQuestions)) {
            throw new Error('AI response is not an array');
        }

        if (parsedQuestions.length === 0) {
            throw new Error('No questions were parsed from the content');
        }

        // Validate each question object
        parsedQuestions.forEach((q, index) => {
            if (!q.question || !q.answer) {
                throw new Error(`Question at index ${index} is missing question or answer field`);
            }
        });

        console.log('DEBUG - Successfully parsed', parsedQuestions.length, 'question(s)');

        res.status(200).json({
            questions: parsedQuestions,
            count: parsedQuestions.length
        });

    } catch (error) {
        console.error('AI question parsing error:', error);

        res.status(500).json({
            error: 'AI parsing failed',
            message: error.message
        });
    }
};

module.exports = {
    generateSuggestions,
    parseQuestions
};
