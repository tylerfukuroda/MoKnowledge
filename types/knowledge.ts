export interface KeyPerson {
    name: string;
    title: string;
    description: string;
}

export interface Offering {
    name: string;
    description: string;
    features: string[];
    pricing: string;
    category: string;
}

export interface SocialMedia {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
}

export interface Branding {
    colors: string[];
    fonts: string[];
    logos: string[];
    writingStyle: string;
    artStyle: string;
}

export interface CompanyFoundation {
    name: string;
    description: string;
    website: string;
    industry: string;
    businessModel: string;
    yearFounded: string;
    employeeCount: string;
    address: string;
    alternateNames: string[];
}

export interface Positioning {
    pitch: string;
    foundingStory: string;
    uniqueSellingPoints: string[];
    differentiators: string[];
}

export interface Market {
    targetBuyers: string[];
    customerNeeds: string[];
    idealCustomer: string;
    industries: string[];
    channels: string[];
    callsToAction: string[];
}

export interface SocialProof {
    testimonials: string[];
    awards: string[];
    certifications: string[];
    pressmentions: string[];
}

export interface KnowledgeBase {
    id: string;
    createdAt: string;
    sourceUrl: string;
    foundation: CompanyFoundation;
    positioning: Positioning;
    market: Market;
    branding: Branding;
    socialMedia: SocialMedia;
    keyPeople: KeyPerson[];
    offerings: Offering[];
    socialProof: SocialProof;
}