require('dotenv').config();

async function listAvailableModels() {
    const API_KEY = process.env.GEMINI_API_KEY;

    console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');
    console.log('\n=== Calling ListModels endpoint ===\n');

    const apiVersions = ['v1beta', 'v1'];

    for (const apiVersion of apiVersions) {
        console.log(`\nTrying API version: ${apiVersion}`);
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${API_KEY}`;

        try {
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Successfully retrieved models list with ${apiVersion}:`);

                if (data.models && data.models.length > 0) {
                    console.log(`\nFound ${data.models.length} models:\n`);
                    data.models.forEach(model => {
                        const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
                        console.log(`  ${supportsGenerate ? '✅' : '❌'} ${model.name}`);
                        if (model.displayName) console.log(`      Display Name: ${model.displayName}`);
                    });

                    // Find first model that supports generateContent
                    const workingModel = data.models.find(m =>
                        m.supportedGenerationMethods?.includes('generateContent')
                    );

                    if (workingModel) {
                        console.log(`\n\n🎯 RECOMMENDED MODEL: ${workingModel.name}`);
                        console.log(`   Use this in your code: "${workingModel.name.replace('models/', '')}"`);
                        return workingModel.name.replace('models/', '');
                    }
                } else {
                    console.log('No models returned');
                }
            } else {
                const error = await response.text();
                console.log(`❌ ${response.status}: ${error}`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }

    return null;
}

listAvailableModels().then(model => {
    if (!model) {
        console.log('\n\n⚠️  CRITICAL ISSUE:');
        console.log('Your API key cannot access any Gemini models.');
        console.log('\nPossible causes:');
        console.log('1. API key is invalid or expired');
        console.log('2. Gemini API is not enabled for this project');
        console.log('3. Billing is not set up');
        console.log('\nPlease check: https://aistudio.google.com/app/apikey');
    }
});
