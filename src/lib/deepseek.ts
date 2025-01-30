import { Platform } from 'react-native';

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';
const DEEPSEEK_API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  throw new Error('Missing DeepSeek API key. Please add EXPO_PUBLIC_DEEPSEEK_API_KEY to your .env file');
}

// Helper function to make API calls to DeepSeek
export async function generateAIResponse(prompt: string) {
  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',  // Using the latest DeepSeek V2.5 model
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

// Helper function to analyze note content
export async function analyzeNoteContent(content: string) {
  const prompt = `Please analyze this note content and provide insights or suggestions for improvement:

${content}

Please provide your analysis in the following format:
1. Summary
2. Key Points
3. Suggestions for Improvement`;

  return generateAIResponse(prompt);
}

// Helper function to generate note ideas
export async function generateNoteIdeas(topic: string) {
  const prompt = `Please suggest some note ideas related to this topic: ${topic}

Please provide your suggestions in a numbered list format, with each idea being concise but descriptive.`;

  return generateAIResponse(prompt);
}

// Helper function to improve note writing
export async function improveNoteWriting(content: string) {
  const prompt = `Please help improve this note content by making it more clear, concise, and well-structured:

${content}

Please maintain the original meaning while enhancing:
1. Clarity
2. Organization
3. Grammar and style`;

  return generateAIResponse(prompt);
} 