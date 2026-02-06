require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        console.log('Testing API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'Missing');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Test 1: Try to list models (if supported)
        console.log('\n=== Attempting to list available models ===');

        // Test 2: Try specific model names one by one
        const modelsToTest = [
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-2.0-flash-exp',
            'models/gemini-pro',
            'models/gemini-1.5-flash',
        ];

        console.log('\n=== Testing individual model names ===');
        for (const modelName of modelsToTest) {
            try {
                console.log(`\nTesting: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hello');
                const response = await result.response;
                const text = response.text();
                console.log(`✅ SUCCESS: ${modelName} works!`);
                console.log(`   Response preview: ${text.substring(0, 50)}...`);
            } catch (error) {
                console.log(`❌ FAILED: ${modelName}`);
                console.log(`   Error: ${error.message}`);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
