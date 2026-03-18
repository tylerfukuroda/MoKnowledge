import { chromium } from "playwright";

export interface PageData {
    url: string;
    title: string;
    text: string;
    metaDescription: string;
    headings: string[];            
    links: string[];               
    emails: string[];              
    phoneNumbers: string[];        
    images: string[];              
}

export async function getInfo(baseUrl: string): Promise<PageData[]> {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const scrapedUrls: Set<string> = new Set();
    const queue: string[] = [baseUrl];
    const pageData: PageData[] = [];

    // Limit the number of pages to scrape to prevent excessive crawling
    const MAX_PAGES = 20;

    while (queue.length > 0 && scrapedUrls.size < MAX_PAGES) {
        const currentUrl = queue.shift()!;

        if (scrapedUrls.has(currentUrl)) continue;
        scrapedUrls.add(currentUrl);

        try {
            await page.goto(currentUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
            const data = await page.evaluate(() => {
                const metaDescription =
                    document.querySelector('meta[name="description"]')
                        ?.getAttribute("content") || "";
                const headings = Array.from(
                    document.querySelectorAll("h1, h2, h3")
                ).map((h) => h.textContent?.trim() || "");
                const links = Array.from(
                    document.querySelectorAll("a[href]")
                ).map((a) => (a as HTMLAnchorElement).href);
                const bodyText = document.body.innerText;
                const emails = [...bodyText.matchAll(/[\w.-]+@[\w.-]+\.\w+/g)]
                    .map((m) => m[0]);

                const phoneNumbers = [
                    ...bodyText.matchAll(/(\+?\d[\d\s\-().]{7,}\d)/g),
                ].map((m) => m[0]);

                const images = Array.from(
                    document.querySelectorAll("img[src]")
                ).map((img) => (img as HTMLImageElement).src);

                return {
                    title: document.title,
                    text: bodyText,
                    metaDescription,
                    headings,
                    links,
                    emails,
                    phoneNumbers,
                    images,
                };
            });

            pageData.push({ url: currentUrl, ...data });

            // Filter links to only include original domain
            const sameOriginLinks = data.links.filter((link) => {
                try {
                    return new URL(link).origin === new URL(baseUrl).origin;
                } catch {
                    return false;
                }
            });

            for (const link of sameOriginLinks) {
                if (!scrapedUrls.has(link)) {
                    queue.push(link);
                }
            }
        } catch (error) {
            console.error(`Error scraping ${currentUrl}:`, error);
        }
    }

    await browser.close();
    return pageData;
}