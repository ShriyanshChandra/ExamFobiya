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

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a question parser. Extract individual question-answer pairs from the provided content and return them with their HTML formatting preserved.

CRITICAL RULES:
1. Preserve the original text content and HTML structure, but clean up structural markers.
2. PRESERVE all HTML formatting tags. DO NOT convert lists to paragraphs.
3. SPECIFICALLY KEEP: <ul>, <ol>, <li>, <strong>, <em>, <br>, <p>.
4. If content contains multiple Q&A pairs, split them into separate entries.
5. Return ONLY valid JSON array format.
6. EXPLICITLY REMOVE any "Q:", "A:", "Question:", "Answer:" prefixes (case-insensitive) from the start of the question or answer text.

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

/**
 * POST /api/ai/check-similar-programming-solutions
 * Find semantically similar solutions from the same programming language.
 * The client supplies the already-filtered candidate set so no solution data
 * outside the admin's current workspace is exposed to this endpoint.
 */
const checkSimilarProgrammingSolutions = async (req, res) => {
    try {
        const { solution, candidates } = req.body || {};

        if (!solution?.title || !solution?.language || !Array.isArray(candidates)) {
            return res.status(400).json({
                error: 'solution (title and language) and candidates are required'
            });
        }

        if (candidates.length === 0) {
            return res.status(200).json({ matches: [], source: 'ai' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const prompt = `You compare programming solution questions for duplicate or near-duplicate topics.

New solution:
${JSON.stringify(solution)}

Candidate solutions (all candidates are already in the same programming language):
${JSON.stringify(candidates)}

Return ONLY valid JSON in this exact shape:
{"matches":[{"id":"candidate id","score":0.0,"reason":"short explanation"}]}

Rules:
- Match by the underlying question/task, not by shared generic words or code style.
- Include only genuinely similar questions with score >= 0.72.
- Return at most 3 matches, ordered from most similar to least similar.
- If there are no similar questions, return {"matches":[]}.
- Copy candidate ids exactly.`;

        const result = await model.generateContent(prompt);
        let text = (await result.response).text().trim();
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(text);
        const candidateIds = new Set(candidates.map(candidate => String(candidate.id)));
        const matches = Array.isArray(parsed.matches)
            ? parsed.matches
                .filter(match => candidateIds.has(String(match.id)) && Number(match.score) >= 0.72)
                .slice(0, 3)
                .map(match => ({
                    id: String(match.id),
                    score: Number(match.score),
                    reason: String(match.reason || 'The question appears to cover a similar task.')
                }))
            : [];

        return res.status(200).json({ matches, source: 'ai' });
    } catch (error) {
        console.error('AI programming-solution similarity check error:', error);
        return res.status(500).json({ error: 'AI similarity check failed', message: error.message });
    }
};

module.exports = {
    generateSuggestions,
    parseQuestions,
    checkSimilarProgrammingSolutions
};
