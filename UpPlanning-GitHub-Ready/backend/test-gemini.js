require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function runTest() {
  const agentTools = [{
    functionDeclarations: [
      {
        name: "create_task",
        description: "Buat tugas baru.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "Judul" },
          },
          required: ["title"]
        }
      }
    ]
  }];

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest',
      tools: agentTools
    });

    const chat = model.startChat({ history: [] });
    let response = await chat.sendMessage("Halo");
    console.log("Success:", response.response.text());
  } catch (error) {
    console.error("Gemini API Error:", error);
  }
}

runTest();
