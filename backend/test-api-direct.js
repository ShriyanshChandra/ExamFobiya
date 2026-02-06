require('dotenv').config();

async function testAPIDirectly() {
    const API_KEY = process.env.GEMINI_API_KEY;

    console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');
    console.log('\n=== Testing with direct HTTP requests ===\n');

    // Models to test
    const models = [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-2.0-flash-exp'
    ];

    // API versions to test
    const apiVersions = ['v1beta', 'v1'];

    for (const apiVersion of apiVersions) {
        console.log(`\n=== Testing API Version: ${apiVersion} ===`);

        for (const model of models) {
            const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${API_KEY}`;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: 'Hello' }]
                        }]
                    })
                });

                if (response.ok) {
                    console.log(`✅ ${model} - WORKS!`);
                    const data = await response.json();
                    return { apiVersion, model, success: true };
                } else {
                    const error = await response.text();
                    console.log(`❌ ${model} - ${response.status}: ${error.substring(0, 100)}`);
                }
            } catch (error) {
                console.log(`❌ ${model} - Error: ${error.message}`);
            }
        }
    }

    return null;
}

testAPIDirectly().then(result => {
    if (result) {
        console.log(`\n\n✅ FOUND WORKING MODEL: ${result.model} with API version ${result.apiVersion}`);
    } else {
        console.log('\n\n❌ No working models found. Please check your API key.');
    }
});
