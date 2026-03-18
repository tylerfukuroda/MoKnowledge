import {ExtractedData} from "./extractor";
import {
    KnowledgeBase,
    CompanyFoundation,
    Positioning,
    Market,
    Branding,
    SocialProof,
    KeyPerson,
    Offering,
} from "../types/knowledge";

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function guessCompanyName(data: ExtractedData, url: string): string {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace("www.", "").split(".")[0];
    } catch {
        return "Unknown";
    }
}

function guessIndustry(data: ExtractedData): string {
    const text = data.allText.toLowerCase();
    if (text.includes("restaurant") || text.includes("dining") || text.includes("food")) return "Food & Beverage";
    if (text.includes("law firm") || text.includes("attorney") || text.includes("legal")) return "Legal";
    if (text.includes("dental") || text.includes("dentist") || text.includes("clinic")) return "Healthcare";
    if (text.includes("real estate") || text.includes("realtor") || text.includes("property")) return "Real Estate";
    if (text.includes("software") || text.includes("saas") || text.includes("tech")) return "Technology";
    if (text.includes("marketing") || text.includes("agency") || text.includes("branding")) return "Marketing";
    if (text.includes("construction") || text.includes("contractor") || text.includes("building")) return "Construction";
    if (text.includes("salon") || text.includes("spa") || text.includes("beauty")) return "Beauty & Wellness";
    if (text.includes("gym") || text.includes("fitness") || text.includes("personal trainer")) return "Fitness";
    if (text.includes("school") || text.includes("education") || text.includes("tutoring")) return "Education";
    return "General Business";
}

function guessPitch(data: ExtractedData): string {
    if (data.metaDescriptions.length > 0) return data.metaDescriptions[0];
    const firstH1 = data.headings.find((h) => h.length > 20 && h.length < 200);
    if (firstH1) return firstH1;
    return "";
}

function guessFoundingStory(data: ExtractedData): string {
    const text = data.aboutText || data.allText;
    const sentences = text.split(/[.!?]/);
    const storySentences = sentences.filter((s) => {
        const lower = s.toLowerCase();
        return (
            lower.includes("founded") ||
            lower.includes("started") ||
            lower.includes("began") ||
            lower.includes("our story") ||
            lower.includes("established") ||
            lower.includes("we started") ||
            lower.includes("it all began")
        );
    });
    return storySentences.slice(0, 3).join(". ").trim();
}

function guessYearFounded(data: ExtractedData): string {
    const text = data.aboutText || data.allText;
    const match = text.match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : "";
}

function guessAddress(data: ExtractedData): string {
    const text = data.contactText || data.allText;
    const match = text.match(/\d{1,5}\s[\w\s]{1,50},\s[\w\s]{1,30},\s[A-Z]{2}\s\d{5}/);
    return match ? match[0] : "";
}

function guessCallsToAction(data: ExtractedData): string[] {
    const ctas = new Set<string>();
    const ctaPatterns = [
        "get started", "contact us", "book a", "schedule a",
        "free consultation", "sign up", "learn more", "get a quote",
        "request a", "try for free", "call us", "get in touch",
    ];
    const text = data.allText.toLowerCase();
    for (const pattern of ctaPatterns) {
        if (text.includes(pattern)) ctas.add(pattern);
    }
    return [...ctas];
}

function guessUniqueSellingPoints(data: ExtractedData): string[] {
    const uspPhrases = [
        "we are the only", "no one else", "unlike other",
        "what sets us apart", "our difference", "why choose us",
        "trusted by", "award winning", "guaranteed", "proven",
    ];
    const found: string[] = [];
    const sentences = data.allText.split(/[.!?]/);
    for (const sentence of sentences) {
        if (uspPhrases.some((p) => sentence.toLowerCase().includes(p))) {
            const trimmed = sentence.trim();
            if (trimmed.length > 20 && trimmed.length < 300) {
                found.push(trimmed);
            }
        }
    }
    return found.slice(0, 5);
}

function guessTargetBuyers(data: ExtractedData): string[] {
    const text = data.allText.toLowerCase();
    const buyers: string[] = [];
    const patterns = [
        "small businesses", "homeowners", "entrepreneurs", "families",
        "startups", "enterprise", "individuals", "professionals",
        "students", "parents", "seniors", "businesses",
    ];
    for (const pattern of patterns) {
        if (text.includes(pattern)) buyers.push(pattern);
    }
    return buyers;
}

function guessKeyPeople(data: ExtractedData): KeyPerson[] {
    const text = data.teamText || data.aboutText || data.allText;
    const people: KeyPerson[] = [];
    const titles = [
        "CEO", "Founder", "Co-Founder", "Owner", "President",
        "Director", "Manager", "CTO", "CFO", "COO", "Partner",
        "Vice President", "VP", "Head of",
    ];
    const sentences = text.split(/[.\n]/);
    for (const sentence of sentences) {
        const matchedTitle = titles.find((t) => sentence.includes(t));
        if (matchedTitle) {
            const nameMatch = sentence.match(/[A-Z][a-z]+\s[A-Z][a-z]+/);
            if (nameMatch) {
                const alreadyAdded = people.some((p) => p.name === nameMatch[0]);
                if (!alreadyAdded) {
                    people.push({
                        name: nameMatch[0],
                        title: matchedTitle,
                        description: sentence.trim().slice(0, 200),
                    });
                }
            }
        }
    }
    return people.slice(0, 10);
}

function guessOfferings(data: ExtractedData): Offering[] {
    const text = data.servicesText || data.allText;
    const offerings: Offering[] = [];
    const headings = data.headings.filter((h) => h.length > 3 && h.length < 80);
    for (const heading of headings.slice(0, 10)) {
        const lower = heading.toLowerCase();
        if (
            lower.includes("service") ||
            lower.includes("product") ||
            lower.includes("plan") ||
            lower.includes("package") ||
            lower.includes("solution") ||
            lower.includes("offering")
        ) {
            offerings.push({
                name: heading,
                description: "",
                features: [],
                pricing: "",
                category: "service",
            });
        }
    }
    const priceMatches = text.match(/\$[\d,]+(\.\d{2})?(\s*\/\s*\w+)?/g) || [];
    if (priceMatches.length > 0 && offerings.length > 0) {
        offerings[0].pricing = priceMatches.join(", ");
    }
    return offerings;
}

function guessWritingStyle(data: ExtractedData): string {
    const text = data.allText.toLowerCase();
    const styles: string[] = [];
    if (text.includes("we ") || text.includes("our ")) styles.push("first-person, conversational");
    if (text.includes("!")) styles.push("enthusiastic");
    if (text.match(/\b(leverage|optimize|synergy|innovative)\b/)) styles.push("corporate, formal");
    if (text.match(/\b(hey|awesome|love|amazing)\b/)) styles.push("casual, friendly");
    return styles.join(", ") || "professional";
}

function guessAwards(data: ExtractedData): string[] {
    const sentences = data.allText.split(/[.!?]/);
    return sentences
        .filter((s) => {
            const lower = s.toLowerCase();
            return (
                lower.includes("award") ||
                lower.includes("recognized") ||
                lower.includes("voted") ||
                lower.includes("best of") ||
                lower.includes("top rated")
            );
        })
        .map((s) => s.trim())
        .slice(0, 5);
}

export function transformData(data: ExtractedData, sourceUrl: string): KnowledgeBase {
    const foundation: CompanyFoundation = {
        name: guessCompanyName(data, sourceUrl),
        description: guessPitch(data),
        website: sourceUrl,
        industry: guessIndustry(data),
        businessModel: "B2C",
        yearFounded: guessYearFounded(data),
        employeeCount: "",
        address: guessAddress(data),
        alternateNames: [],
    };

    const positioning: Positioning = {
        pitch: guessPitch(data),
        foundingStory: guessFoundingStory(data),
        uniqueSellingPoints: guessUniqueSellingPoints(data),
        differentiators: [],
    };

    const market: Market = {
        targetBuyers: guessTargetBuyers(data),
        customerNeeds: [],
        idealCustomer: "",
        industries: [foundation.industry],
        channels: [],
        callsToAction: guessCallsToAction(data),
    };

    const branding: Branding = {
        colors: data.colors.slice(0, 10),
        fonts: data.fonts,
        logos: data.logos,
        writingStyle: guessWritingStyle(data),
        artStyle: "",
    };

    const socialProof: SocialProof = {
        testimonials: data.testimonialsText.slice(0, 10),
        awards: guessAwards(data),
        certifications: [],
        pressmentions: [],
    };

    return {
        id: generateId(),
        createdAt: new Date().toISOString(),
        sourceUrl,
        foundation,
        positioning,
        market,
        branding,
        socialMedia: data.socialMedia,
        keyPeople: guessKeyPeople(data),
        offerings: guessOfferings(data),
        socialProof,
    };
}