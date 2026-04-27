import axios from "axios";
import * as cheerio from "cheerio";

export async function crawl(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                "Accept":
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Connection": "keep-alive",
            },
        });

        const $ = cheerio.load(data);
  

        return {
            title: $("title").text().trim(),
            metaDescription: $('meta[name="description"]').attr("content") || "",
            h1: $("h1").first().text().trim(),
            h2Count: $("h2").length,
            images: $("img").length,
            imagesWithoutAlt: $("img:not([alt])").length,
            links: $("a").length,
        };
    } catch (error) {
        console.error("AXIOS FULL ERROR:", error);

        if (error.response) {
            throw new Error(`HTTP ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            throw new Error("No response received from server");
        } else {
            throw new Error(error.message);
        }
    }

}