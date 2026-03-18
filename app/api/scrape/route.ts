import {NextRequest, NextResponse} from "next/server";
import {getInfo} from "../../../scraper/scraper";
import {extractData} from "../../../scraper/extractor";
import {transformData} from "../../../scraper/transformer";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {url} = body;

        if (!url) {
            return NextResponse.json(
                {error: "URL is required"},
                {status: 400}
            );
        }

        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: "Invalid URL format" },
                { status: 400 }
            );
        }

        const pages = await getInfo(url);
        const extracted = extractData(pages);
        const knowledgeBase = transformData(extracted, url);

        return NextResponse.json({success: true, data: knowledgeBase});

    } catch (error) {
        console.error("Scrape error:", error);
        return NextResponse.json(
            { error: "Failed to scrape website" },
            { status: 500 }
        );
    }
}
