import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { crawl } from "./src/crawler/crawl.js";
import { analyzeSEO } from "./src/analyze/analyze.js";
import { generateReport } from "./src/gemeniReport/report.js";
import path from "path";
import { getPageSpeed } from "./src/pagespeed/pagespeed.js";
import { brokenlink, getLinks } from "./src/brokenlink/brokenlink.js";
import { generateKeywords } from "./src/keyword/keyword.js";



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

        // pagespeed
        let pagespeed = null;
        try {
            pagespeed = await getPageSpeed(url);
        } catch (err) {
            console.log("PageSpeed skipped:", err.message);
        }

        // brokenlink
        let brokenlink = null;
        try {
            brokenlink = await getLinks(url);
        } catch (err) {
            console.log("Failed fetching links ", err.message);
        }

        let report = null;

        // 👇 Only call AI if requested
        if (ai === true) {
            report = await generateReport(data, analysis);
        }

        res.json({
            success: true,
            data,
            analysis,
            report,
            pagespeed,
            brokenlink
        });
    } catch (error) {
        console.error("Crawl Error:", error);

        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

app.post("/pagespeed", async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: "URL is required",
            });
        }

        const data = await getPageSpeed(url);

        res.json({
            success: true,
            data,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

app.post('/checkbrokenlink', brokenlink);

app.post("/generateKeywords", generateKeywords);

app.listen(PORT || 3000, () => {
    console.log("Server is running on port " + PORT);
})