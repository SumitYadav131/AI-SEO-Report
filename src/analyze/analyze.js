export function analyzeSEO(data) {
    let score = 0;
    const issues = [];

    // ON-PAGE SEO (40)
  
    // Title (10)
    if (data.title) {
        if (data.title.length >= 30 && data.title.length <= 60) {
            score += 10;
        } else {
            score += 5;
            issues.push("Optimize title length (30-60 chars)");
        }
    } else {
        issues.push("Missing title tag");
    }

    // Meta Description (10)
    if (data.metaDescription) {
        if (data.metaDescription.length >= 120 && data.metaDescription.length <= 160) {
            score += 10;
        } else {
            score += 5;
            issues.push("Optimize meta description (120-160 chars)");
        }
    } else {
        issues.push("Missing meta description");
    }

    // H1 (10)
    if (data.h1) {
        score += 10;
    } else {
        issues.push("Missing H1 tag");
    }

    // Headings Structure (10)
    if (data.h2Count > 0) {
        score += 10;
    } else {
        issues.push("No H2 tags found");
    }

    // MEDIA (10)

    if (data.images > 0) {
        const altRatio = data.imagesWithoutAlt / data.images;

        if (altRatio === 0) {
            score += 10;
        } else if (altRatio < 0.3) {
            score += 7;
            issues.push("Some images missing alt text");
        } else {
            score += 3;
            issues.push("Many images missing alt text");
        }
    }

    // LINKS (5)

    if (data.links >= 20) {
        score += 5;
    } else if (data.links >= 5) {
        score += 3;
        issues.push("Improve internal linking");
    } else {
        issues.push("Very few links on page");
    }

    // BONUS (5) — structure quality

    if (data.h2Count >= 5) {
        score += 5;
    }

    return {
        score: Math.min(score, 100),
        issues,
    };
}