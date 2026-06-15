const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const match = env.match(/GEMINI_API_KEY=(.*)/);
if (match) process.env.GEMINI_API_KEY = match[1].trim();

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.5-flash-001"];
  
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hello");
      console.log(`Success with ${m}:`, result.response.text());
      return;
    } catch (e) {
      console.log(`Failed with ${m}:`, e.message);
    }
  }
}

test();
