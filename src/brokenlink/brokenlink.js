import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";

export const brokenlink = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.json({ success: false, error: "URL is required" });
        }

        // 1️ Fetch HTML
        const { data: html } = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                Connection: "keep-alive",
            },
        });

        const $ = cheerio.load(html);

        // 2️ Extract all links
        let links = [];
        $("a").each((_, el) => {
            let href = $(el).attr("href");

            if (!href) return;

            // convert relative → absolute
            if (href.startsWith("/")) {
                href = new URL(href, url).href;
            }

            // ignore anchors, mail, tel
            if (
                href.startsWith("#") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:")
            ) return;

            links.push(href);
        });

        // 3️ Remove duplicates
        const uniqueLinks = [...new Set(links)];

        // 4️ Limit concurrency (IMPORTANT)
        const limit = pLimit(5);

        // 5️ Check links
        const results = await Promise.allSettled(
            uniqueLinks.map(link =>
                limit(() =>
                    axios.get(link, {
                        timeout: 8000,
                        validateStatus: () => true
                    })
                )
            )
        );

        // 6️ Categorize
        const brokenLinks = [];
        const warnings = [];
        const healthyLinks = [];

        results.forEach((res, i) => {
            const link = uniqueLinks[i];

            if (res.status === "fulfilled") {
                const status = res.value.status;

                if (status >= 400 && status !== 429) {
                    brokenLinks.push({ url: link, status });
                } else if (status === 429) {
                    warnings.push({ url: link, status: "Rate Limited (429)" });
                } else {
                    healthyLinks.push({ url: link, status });
                }

            } else {
                warnings.push({ url: link, status: "Request Failed" });
            }
        });

        // 7️ Response
        res.json({
            success: true,
            totalLinks: uniqueLinks.length,
            brokenCount: brokenLinks.length,
            warningCount: warnings.length,
            healthyCount: healthyLinks.length,
            brokenLinks,
            warnings
        });

    } catch (error) {
        res.json({
            success: false,
            error: "Failed to check links",
            details: error.message
        });
    }
}
