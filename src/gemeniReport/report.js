import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const geminiKey = process.env.GEMINI_KEY;
console.log(geminiKey);


const genAI = new GoogleGenerativeAI(geminiKey);

export async function generateReport(data, analysis) {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
You are an SEO expert.

Website Data:
${JSON.stringify(data, null, 2)}

SEO Score: ${analysis.score}

Issues:
${analysis.issues.join("\n")}

Tasks:
- Explain issues simply
- Suggest fixes
- Give final summary
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}