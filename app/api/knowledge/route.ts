import {NextRequest, NextResponse} from "next/server";
import {KnowledgeBase} from "@/types/knowledge";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src/data/knowledge.json");

function readKnowledgeBases(): KnowledgeBase[] {
    try {
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, JSON.stringify([]));
            return [];
        }
        const fileContent = fs.readFileSync(dataFilePath, "utf-8");
        return JSON.parse(fileContent);
    } catch {
        return [];
    }
}

function writeKnowledgeBases(data: KnowledgeBase[]): void {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
    try {
        const knowledgeBases = readKnowledgeBases();
        return NextResponse.json({ success: true, data: knowledgeBases });
    } catch (error) {
        console.error("Error loading knowledge bases:", error);
        return NextResponse.json(
            {error: "Failed to load knowledge bases"},
            {status: 500}
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const knowledgeBase: KnowledgeBase = body.data;

        if (!knowledgeBase) {
            return NextResponse.json(
                {error: "No knowledge base data provided"},
                {status: 400}
            );
        }

        const knowledgeBases = readKnowledgeBases();
        knowledgeBases.push(knowledgeBase);
        writeKnowledgeBases(knowledgeBases);

        return NextResponse.json({ success: true, data: knowledgeBase });
    } catch (error) {
        console.error("Error saving knowledge base:", error);
        return NextResponse.json(
            {error: "Failed to save knowledge base"},
            {status: 500}
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const {searchParams} = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {error: "ID is required"},
                {status: 400}
            );
        }

        const knowledgeBases = readKnowledgeBases();
        const filtered = knowledgeBases.filter((kb) => kb.id !== id);
        writeKnowledgeBases(filtered);

        return NextResponse.json({success: true});
    } catch (error) {
        console.error("Error deleting knowledge base:", error);
        return NextResponse.json(
            {error: "Failed to delete knowledge base"},
            {status: 500}
        );
    }
}
