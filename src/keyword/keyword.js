import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);


export async function generateKeywords(req, res) {
    try {
        const { url } = req.body;

        if (!url) {
            return res.json({ success: false, error: "URL required" });
        }

        // 1. Fetch page
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // 2. Extract content
        const title = $("title").text();
        const meta = $("meta[name='description']").attr("content") || "";
        const h1 = $("h1").text();
        const h2 = $("h2")
            .map((i, el) => $(el).text())
            .get()
            .join(", ");

        const content = $("p")
            .map((i, el) => $(el).text())
            .get()
            .slice(0, 20) // limit for AI
            .join(" ");

        // 3. AI prompt
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview"
        });

        const prompt = `
You are an SEO expert.

Based on this website content, generate:

1. 20 HIGH-RANKING keywords
2. 15 LONG-TAIL keywords
3. 10 TRENDING keywords (2025 SEO trends)

Content:
Title: ${title}
Meta: ${meta}
H1: ${h1}
H2: ${h2}
Text: ${content}

Return ONLY JSON:
{
  "primary": [],
  "longTail": [],
  "trending": []
}
`;



        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Try parse JSON
        let keywords;
        try {
            keywords = JSON.parse(text);
        } catch {
            keywords = { raw: text };
        }

        res.json({
            success: true,
            keywords,
        });
    } catch (err) {
        res.json({
            success: false,
            error: "Failed to generate keywords",
            details: err.message,
        });
    }
}


export async function getKeywords(url) {
    try {
        if (!url) {
            return ({ success: false, error: "URL required" });
        }

        // 1. Fetch page
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // 2. Extract content
        const title = $("title").text();
        const meta = $("meta[name='description']").attr("content") || "";
        const h1 = $("h1").text();
        const h2 = $("h2")
            .map((i, el) => $(el).text())
            .get()
            .join(", ");

        const content = $("p")
            .map((i, el) => $(el).text())
            .get()
            .slice(0, 20) // limit for AI
            .join(" ");

        // 3. AI prompt
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview"
        });

        const prompt = `
You are an SEO expert.

Based on this website content, generate:

1. 20 HIGH-RANKING keywords
2. 15 LONG-TAIL keywords
3. 10 TRENDING keywords (2025 SEO trends)

Content:
Title: ${title}
Meta: ${meta}
H1: ${h1}
H2: ${h2}
Text: ${content}

Return ONLY JSON:
{
  "primary": [],
  "longTail": [],
  "trending": []
}
`;



        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Try parse JSON
        let keywords;
        try {
            keywords = JSON.parse(text);
        } catch {
            keywords = { raw: text };
        }

        return ({
            success: true,
            keywords,
        });
    } catch (err) {
        return ({
            success: false,
            error: "Failed to generate keywords",
            details: err.message,
        });
    }
}