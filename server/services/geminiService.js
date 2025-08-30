const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = "AIzaSyCkoYKmk5hEBjzPawDg1_2lfnjI4JYXtPQ";
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
]; // Fixed: Removed extra semicolon

async function runChat(prompt, chatHistory = []) {
    try {
        // Validate input
        if (!prompt || typeof prompt !== 'string') {
            throw new Error("Invalid prompt provided");
        }

        // Process chat history - ensure proper format
        const formattedHistory = chatHistory
            .slice(-10) // Keep last 10 messages for context
            .filter(msg => msg && msg.content && msg.role) // Filter out invalid messages
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: String(msg.content).trim() }]
            }));

        const chatSession = model.startChat({
            generationConfig,
            safetySettings,
            history: formattedHistory,
        });

        const result = await chatSession.sendMessage(prompt.trim());
        const response = result.response;
        const textResponse = response.text();

        // Validate response
        if (!textResponse || textResponse.trim().length === 0) {
            return "I'm sorry, I was unable to generate a response. Please try again.";
        }

        return textResponse.trim();
        
    } catch (error) {
        console.error("Error in runChat:", error);
        
        // Handle specific error types
        if (error.message.includes('SAFETY')) {
            return "I can't provide a response to that request due to safety guidelines. Please try rephrasing your question.";
        }
        
        if (error.message.includes('QUOTA')) {
            return "API quota exceeded. Please try again later.";
        }
        
        if (error.message.includes('API_KEY')) {
            return "API key issue. Please check your configuration.";
        }
        
        // Generic error response
        return "I'm experiencing technical difficulties. Please try again.";
    }
}

// Optional: Function to validate chat history format
function validateChatHistory(history) {
    if (!Array.isArray(history)) {
        return [];
    }
    
    return history.filter(msg => 
        msg && 
        typeof msg === 'object' && 
        msg.content && 
        msg.role && 
        (msg.role === 'user' || msg.role === 'assistant')
    );
}

module.exports = { 
    runChat,
    validateChatHistory 
};