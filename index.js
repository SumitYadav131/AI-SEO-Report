import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { crawl } from "./src/crawler/crawl.js";
import { analyzeSEO } from "./src/analyze/analyze.js";
import { generateReport } from "./src/gemeniReport/report.js";
import path from "path";


dotenv.config();

const PORT = process.env.port

const app = express();

app.use(express.json());

app.use(cors());

app.use(express.static("public"));

app.get('/', async (req, res) => {
    res.send("SEO Audit tool running");
});

app.post("/crawl", async (req, res) => {
    try {
        const { url, ai } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        const data = await crawl(url);
        const analysis = await analyzeSEO(data);

        let report = null;

        // 👇 Only call AI if requested
        if (ai === true) {
            report = await generateReport(data, analysis);
        }

        res.json({
            success: true,
            data,
            analysis,
            report
        });
    } catch (error) {
        console.error("Crawl Error:", error);

        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

app.listen(PORT || 3000, () => {
    console.log("Serving is running on port " + PORT);
})