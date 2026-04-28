import axios from "axios";
import dotenv from "dotenv"

dotenv.config();

export async function getPageSpeed(url) {
    try {
        const apiKey = "AIzaSyD9gg_p44GnOTrX1FJDENfofykGJldLerQ";
        const key = process.env.PAGEINSIGHT_KEY
        console.log(key);

        const mobileRes = await axios.get(
            `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`,
            {
                params: {
                    url,
                    key: apiKey,
                    strategy: "mobile",
                },
            }
        );

        const desktopRes = await axios.get(
            `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`,
            {
                params: {
                    url,
                    key: apiKey,
                    strategy: "desktop",
                },
            }
        );

        return {
            mobile: extractData(mobileRes.data),
            desktop: extractData(desktopRes.data),
        };
    } catch (err) {
        console.error("PageSpeed Error:", err.response?.data || err.message);
        throw new Error(err.response?.data?.error?.message || "Failed to fetch PageSpeed data");
    }
}

function extractData(data) {
    const lighthouse = data.lighthouseResult;

    return {
        performance: lighthouse.categories.performance.score * 100,
        lcp: lighthouse.audits["largest-contentful-paint"].displayValue,
        cls: lighthouse.audits["cumulative-layout-shift"].displayValue,
    };
}