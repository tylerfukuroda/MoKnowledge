import { PageData } from "./scraper";

export interface ExtractedData {
    emails: string[];
    phoneNumbers: string[];
    socialMedia: {
        twitter?: string;
        facebook?: string;
        linkedin?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
    };
    metaDescriptions: string[];
    allText: string;
    headings: string[];
    colors: string[];
    logos: string[];
    fonts: string[];
    aboutText: string;
    teamText: string;
    servicesText: string;
    contactText: string;
    testimonialsText: string[];
    pageCount: number;
    pageUrls: string[];
}

export function extractData(pages: PageData[]): ExtractedData {
    const emails: string[] = [];
    const phoneNumbers: string[] = [];
    const headings: string[] = [];
    const metaDescriptions: string[] = [];
    const colors: string[] = [];
    const logos: string[] = [];
    const testimonialsText: string[] = [];
    const pageUrls: string[] = [];

    let allText = "";
    let aboutText = "";
    let teamText = "";
    let servicesText = "";
    let contactText = "";

    const socialMedia: ExtractedData["socialMedia"] = {};

    for (const page of pages) {
        pageUrls.push(page.url);
        allText += page.text + "\n";
        if (page.metaDescription) {
            metaDescriptions.push(page.metaDescription);
        }

        headings.push(...page.headings);
        emails.push(...page.emails);
        phoneNumbers.push(...page.phoneNumbers);

        for (const link of page.links) {
            if (link.includes("linkedin.com") && !socialMedia.linkedin) {
                socialMedia.linkedin = link;
            }
            if (link.includes("instagram.com") && !socialMedia.instagram) {
                socialMedia.instagram = link;
            }
            if (link.includes("facebook.com") && !socialMedia.facebook) {
                socialMedia.facebook = link;
            }
            if ((link.includes("twitter.com") || link.includes("x.com")) && !socialMedia.twitter) {
                socialMedia.twitter = link;
            }
            if (link.includes("youtube.com") && !socialMedia.youtube) {
                socialMedia.youtube = link;
            }
            if (link.includes("tiktok.com") && !socialMedia.tiktok) {
                socialMedia.tiktok = link;
            }
        }

        for (const img of page.images) {
            if (img.toLowerCase().includes("logo") || img.toLowerCase().includes("brand")) {
                logos.push(img);
            }
        }

        const url = page.url.toLowerCase();
        if (url.includes("about")) {
            aboutText += " " + page.text;
        }
        if (url.includes("team") || url.includes("people") || url.includes("staff")) {
            teamText += " " + page.text;
        }
        if (url.includes("service") || url.includes("product") || url.includes("offering")) {
            servicesText += " " + page.text;
        }
        if (url.includes("contact")) {
            contactText += " " + page.text;
        }

        const quoteMatches = page.text.match(/"([^"]{40,300})"/g);
        if (quoteMatches) {
            testimonialsText.push(...quoteMatches);
        }
    }

    const hexColorRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    const colorMatches = allText.match(hexColorRegex) || [];
    colors.push(...colorMatches);

    return {
        emails: [...new Set(emails)],
        phoneNumbers: [...new Set(phoneNumbers)],
        socialMedia,
        metaDescriptions,
        allText,
        headings: [...new Set(headings)],
        colors: [...new Set(colors)],
        logos: [...new Set(logos)],
        fonts: [],
        aboutText,
        teamText,
        servicesText,
        contactText,
        testimonialsText: [...new Set(testimonialsText)],
        pageCount: pages.length,
        pageUrls,
    };
}